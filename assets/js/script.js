function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "item";
}

/* ============================================================
   Professional International Fuzzy Search Engine
   Handles: single letters, multi-word tokens, typos/misspellings,
   diacritics/accents, brand aliases, and relevance ranking.
   ============================================================ */

const SEARCH_ALIASES = {
  yt: ["youtube", "you tube"],
  gta: ["grand theft auto", "rockstar"],
  cod: ["call of duty", "black ops", "warzone"],
  dbd: ["dead by daylight"],
  mw: ["modern warfare"],
  mw4: ["modern warfare 4"],
  ps: ["playstation", "ps plus", "psn"],
  sub: ["subscription", "membership", "premium"],
  ai: ["chatgpt", "claude", "gemini", "grok", "elevenlabs", "artificial intelligence", "openart", "character"],
  music: ["spotify", "apple music", "youtube premium"],
  movie: ["netflix", "hulu", "disney", "paramount", "peacock", "crunchyroll"],
  shows: ["netflix", "hulu", "disney", "paramount", "peacock", "crunchyroll"],
  series: ["netflix", "hulu", "disney", "paramount", "peacock", "crunchyroll"],
  stream: ["netflix", "hulu", "disney", "paramount", "peacock", "crunchyroll", "twitch"],
  robux: ["roblox", "robux"],
  minecoins: ["minecraft", "minecoins"],
  vbucks: ["fortnite", "v-bucks", "vbucks"],
  fifa: ["ea sports fc", "fc26", "fc 26"]
};

function normalizeSearchText(text) {
  if (!text) return "";
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/æ/g, "ae")
    .replace(/œ/g, "oe")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function fastLevenshtein(s1, s2) {
  if (s1 === s2) return 0;
  if (!s1.length) return s2.length;
  if (!s2.length) return s1.length;
  if (s1.length > s2.length) {
    const tmp = s1; s1 = s2; s2 = tmp;
  }
  let prev = Array.from({ length: s1.length + 1 }, (_, i) => i);
  let curr = new Array(s1.length + 1);

  for (let i = 1; i <= s2.length; i++) {
    curr[0] = i;
    const c2 = s2.charCodeAt(i - 1);
    for (let j = 1; j <= s1.length; j++) {
      const cost = s1.charCodeAt(j - 1) === c2 ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    const swap = prev; prev = curr; curr = swap;
  }
  return prev[s1.length];
}

function scoreCoupon(rawQuery, coupon) {
  const qNorm = normalizeSearchText(rawQuery);
  if (!qNorm) return 0;

  const tNorm = normalizeSearchText(coupon.title);
  const catNorm = normalizeSearchText(coupon.category);
  const descNorm = normalizeSearchText(coupon.description);

  const qTokens = qNorm.split(/\s+/).filter(Boolean);
  const tTokens = tNorm.split(/\s+/).filter(Boolean);

  const qCompact = qNorm.replace(/\s+/g, "");
  const tCompact = tNorm.replace(/\s+/g, "");

  let score = 0;

  // 1. Exact full title match
  if (qNorm === tNorm) {
    return 1500;
  }

  // 2. Title starts with query
  if (tNorm.startsWith(qNorm)) {
    score += 450;
  }

  // 3. Title contains exact query phrase or words
  if (` ${tNorm} `.includes(` ${qNorm} `)) {
    score += 350;
  } else if (tNorm.includes(qNorm)) {
    score += 250;
  }

  // 4. Compact match (e.g. "gta6" in "gta 6" or "paramount+" in "paramount plus")
  if (qCompact.length >= 2 && tCompact.includes(qCompact)) {
    score += 220;
  }

  // 5. Alias / synonym match
  const aliasList = SEARCH_ALIASES[qNorm] || [];
  for (const alias of aliasList) {
    const aNorm = normalizeSearchText(alias);
    if (tNorm.includes(aNorm)) {
      score += 400;
    } else if (catNorm.includes(aNorm)) {
      score += 200;
    } else if (descNorm.includes(aNorm)) {
      score += 100;
    }
  }

  // 6. Token-level matching (prefix and multi-word coverage)
  let matchedTokens = 0;
  for (const qWord of qTokens) {
    let wordMatched = false;

    // Check if any word in title starts with this query token
    for (const tWord of tTokens) {
      if (tWord.startsWith(qWord)) {
        score += qTokens.length === 1 && qWord.length === 1 ? 180 : 160;
        wordMatched = true;
        break;
      }
    }

    if (!wordMatched && qWord.length >= 3) {
      // Fuzzy word matching (typo tolerance)
      const maxDistance = qWord.length <= 4 ? 1 : qWord.length <= 7 ? 2 : 3;
      let bestDist = 999;
      for (const tWord of tTokens) {
        if (Math.abs(tWord.length - qWord.length) <= maxDistance) {
          const dist = fastLevenshtein(qWord, tWord);
          if (dist <= maxDistance && dist < bestDist) {
            bestDist = dist;
          }
        }
      }
      if (bestDist <= maxDistance) {
        score += Math.max(50, 160 - bestDist * 40);
        wordMatched = true;
      }
    }

    if (!wordMatched && (catNorm.includes(qWord) || descNorm.includes(qWord))) {
      score += 60;
      wordMatched = true;
    }

    if (wordMatched) matchedTokens++;
  }

  if (qTokens.length > 1) {
    if (matchedTokens === qTokens.length) {
      score += 300; // All tokens matched!
    } else if (matchedTokens > 0) {
      score += matchedTokens * 60;
    }
  }

  // 7. Category match
  if (catNorm.includes(qNorm)) {
    score += 90;
  }

  // 8. Description match
  if (qNorm.length >= 3 && descNorm.includes(qNorm)) {
    score += 40;
  }

  return score;
}

const state = {
  coupons: [],
  filtered: [],
  activeCategory: "All",
  search: "",
  selectedCoupon: null,
  progressTimer: null,
  countdownTimer: null,
  leftTimer: null,
  loaderTimer: null,
  lockSeconds: 15 * 60,
  remainingSeconds: 15 * 60,
  progressPercent: 0
};

const els = {
  body: document.body,
  pageLoader: document.querySelector("#pageLoader"),
  searchForm: document.querySelector("#searchForm"),
  search: document.querySelector("#couponSearch"),
  clearSearch: document.querySelector("#clearSearch"),
  categoryFilters: document.querySelector("#categoryFilters"),
  couponGrid: document.querySelector("#couponGrid"),
  newestSlider: document.querySelector("#newestSlider"),
  slidePrev: document.querySelector("#slidePrev"),
  slideNext: document.querySelector("#slideNext"),
  resultCount: document.querySelector("#resultCount"),
  activeFilterText: document.querySelector("#activeFilterText"),
  allCouponsTitle: document.querySelector("#allCouponsTitle"),
  emptyState: document.querySelector("#emptyState"),
  emptyStateMessage: document.querySelector("#emptyStateMessage"),
  resetFilters: document.querySelector("#resetFilters"),
  modal: document.querySelector("#couponModal"),
  modalHero: document.querySelector("#modalHero"),
  modalIcon: document.querySelector("#modalIcon"),
  modalCategory: document.querySelector("#modalCategory"),
  modalTitle: document.querySelector("#modalTitle"),
  modalLeftCount: document.querySelector("#modalLeftCount"),
  modalOfferPrompt: document.querySelector("#modalOfferPrompt"),
  ticketTitle: document.querySelector("#ticketTitle"),
  ticketSubtitle: document.querySelector("#ticketSubtitle"),
  modalRating: document.querySelector("#modalRating"),
  modalUsedToday: document.querySelector("#modalUsedToday"),
  modalExpires: document.querySelector("#modalExpires"),
  modalDescription: document.querySelector("#modalDescription"),
  modalPreviewCode: document.querySelector("#modalPreviewCode"),
  lockedPreviewCode: document.querySelector("#lockedPreviewCode"),
  stateDetails: document.querySelector("#stateDetails"),
  stateProgress: document.querySelector("#stateProgress"),
  stateReady: document.querySelector("#stateReady"),
  startReveal: document.querySelector("#startReveal"),
  progressRing: document.querySelector("#progressRing"),
  progressValue: document.querySelector("#progressValue"),
  progressMessage: document.querySelector("#progressMessage"),
  readyTimer: document.querySelector("#readyTimer"),
  lockerButton: document.querySelector("#lockerButton"),
  waitingInline: document.querySelector("#waitingInline")
};

const progressTextByPercent = [
  [1, "Starting secure coupon check..."],
  [18, "Preparing your coupon code..."],
  [36, "Checking code availability..."],
  [54, "Reserving this offer for you..."],
  [72, "Loading final reveal step..."],
  [88, "Finalizing coupon code..."],
  [100, "Coupon code is ready!"]
];

init();

function init() {
  bindEvents();
  initSearchFromUrl();
  loadCoupons();
}

function initSearchFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q") || params.get("search");
    if (initialQuery && els.search) {
      els.search.value = initialQuery;
      state.search = initialQuery;
      if (els.clearSearch) {
        els.clearSearch.classList.add("is-visible");
      }
    }
  } catch (e) {}
}

function syncUrlQuery() {
  try {
    const url = new URL(window.location.href);
    if (state.search && state.search.trim()) {
      url.searchParams.set("q", state.search.trim());
    } else {
      url.searchParams.delete("q");
      url.searchParams.delete("search");
    }
    window.history.replaceState(null, "", url.toString());
  } catch (e) {}
}

function clearSearchFilter() {
  state.search = "";
  if (els.search) {
    els.search.value = "";
    els.search.focus();
  }
  if (els.clearSearch) {
    els.clearSearch.classList.remove("is-visible");
  }
  applyFilters();
  syncUrlQuery();
}

function bindEvents() {
  if (els.search) {
    els.search.addEventListener("input", () => {
      state.search = els.search.value;
      if (els.clearSearch) {
        els.clearSearch.classList.toggle("is-visible", Boolean(state.search.trim()));
      }
      applyFilters();
      syncUrlQuery();
    });

    els.search.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        clearSearchFilter();
      }
    });
  }

  if (els.searchForm) {
    els.searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      applyFilters();
      if (els.search) els.search.blur();
    });
  }

  if (els.clearSearch) {
    els.clearSearch.addEventListener("click", clearSearchFilter);
  }

  if (els.resetFilters) {
    els.resetFilters.addEventListener("click", () => {
      state.activeCategory = "All";
      clearSearchFilter();
      renderCategories();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (els.slidePrev) els.slidePrev.addEventListener("click", () => slideNewest(-1));
  if (els.slideNext) els.slideNext.addEventListener("click", () => slideNewest(1));

  document.querySelectorAll("[data-close-modal]").forEach((item) => item.addEventListener("click", closeModal));

  window.addEventListener("resize", syncRevealButton);
  window.addEventListener("orientationchange", () => window.setTimeout(syncRevealButton, 160));

  if (els.startReveal) els.startReveal.addEventListener("click", startRevealFlow);
  if (els.lockerButton) els.lockerButton.addEventListener("click", openLockerAndWait);
}

async function loadCoupons() {
  try {
    let response;
    try {
      response = await fetch("assets/php/coupons.php", {
        headers: { Accept: "application/json" },
        cache: "no-store"
      });
      if (!response.ok) throw new Error(`Status ${response.status}`);
    } catch (phpErr) {
      response = await fetch("assets/php/coupons.json", {
        headers: { Accept: "application/json" },
        cache: "no-store"
      });
    }
    if (!response.ok) throw new Error(`Coupon request failed: ${response.status}`);
    const data = await response.json();
    state.coupons = Array.isArray(data.coupons) ? data.coupons : [];
    state.filtered = [...state.coupons];
    renderCategories(data.site?.visibleCategories || []);
    renderNewest();
    applyFilters();
  } catch (error) {
    console.error(error);
    if (els.resultCount) els.resultCount.textContent = "Coupons could not load";
    if (els.activeFilterText) els.activeFilterText.textContent = "Make sure PHP is running or coupons.json is available.";
    if (els.emptyState) els.emptyState.hidden = false;
  }
}

function renderCategories(preferredCategories = null) {
  if (!els.categoryFilters) return;
  const unique = [...new Set(state.coupons.map((coupon) => coupon.category).filter(Boolean))];
  const visible = Array.isArray(preferredCategories) && preferredCategories.length ? preferredCategories : unique.slice(0, 6);
  const categories = ["All", ...visible.slice(0, 6)];

  els.categoryFilters.innerHTML = categories.map((category) => {
    const active = category === state.activeCategory ? "is-active" : "";
    return `<button class="chip ${active}" type="button" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`;
  }).join("");

  els.categoryFilters.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      state.activeCategory = chip.dataset.category;
      state.search = "";
      if (els.search) els.search.value = "";
      if (els.clearSearch) els.clearSearch.classList.remove("is-visible");
      renderCategories(visible);
      applyFilters();
      syncUrlQuery();
    });
  });
}

function renderNewest() {
  if (!els.newestSlider) return;
  const popular = state.coupons.filter((coupon) => coupon.isPopular);
  els.newestSlider.innerHTML = popular.map((coupon) => `
    <article class="newest-card theme-${escapeHtml(coupon.theme)}">
      <div class="visual-band" ${headerStyle(coupon)}>
        ${ratingPill(coupon)}
        ${logoMarkup(coupon, "floating-logo")}
      </div>
      <div class="newest-body">
        <h3><a href="products/${slugify(coupon.title)}.html" class="coupon-link">${escapeHtml(coupon.title)}</a></h3>
        <p>${escapeHtml(shortenDescription(coupon.description, 66))}</p>
        <button class="get-code animated-cta" type="button" data-coupon-id="${escapeHtml(coupon.id)}">✂ Get Code</button>
      </div>
    </article>
  `).join("");
  bindCouponButtons(els.newestSlider);
}

function applyFilters() {
  const query = state.search ? state.search.trim() : "";
  const isSearching = Boolean(query);
  els.body.classList.toggle("is-searching", isSearching);
  if (els.allCouponsTitle) {
    els.allCouponsTitle.textContent = isSearching ? "Search Results" : "All Coupons";
  }

  if (!isSearching) {
    state.filtered = state.coupons.filter((coupon) => {
      return state.activeCategory === "All" || coupon.category === state.activeCategory;
    });
  } else {
    // Advanced international fuzzy match
    const scoredList = [];
    for (const coupon of state.coupons) {
      const score = scoreCoupon(query, coupon);
      if (score > 0) {
        scoredList.push({ coupon, score });
      }
    }

    scoredList.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.coupon.isPopular !== a.coupon.isPopular) return (b.coupon.isPopular ? 1 : 0) - (a.coupon.isPopular ? 1 : 0);
      return Number(b.coupon.rating || 0) - Number(a.coupon.rating || 0);
    });

    state.filtered = scoredList.map((item) => item.coupon);
  }

  renderCoupons();
}

function renderCoupons() {
  if (!els.couponGrid) return;
  const ALL_COUPONS_LIMIT = 10;
  const isSearching = Boolean(state.search && state.search.trim());
  const visibleCoupons = isSearching ? state.filtered : state.filtered.slice(0, ALL_COUPONS_LIMIT);

  els.couponGrid.innerHTML = visibleCoupons.map(couponCard).join("");
  bindCouponButtons(els.couponGrid);

  if (els.resultCount) {
    if (isSearching) {
      const count = state.filtered.length;
      els.resultCount.textContent = `${count} coupon${count === 1 ? "" : "s"} found`;
    } else {
      els.resultCount.textContent = `${visibleCoupons.length} coupon${visibleCoupons.length === 1 ? "" : "s"} found`;
    }
  }

  if (els.activeFilterText) {
    els.activeFilterText.textContent = isSearching
      ? `Results for "${state.search.trim()}"`
      : state.activeCategory === "All"
        ? "Showing popular coupons"
        : `Category: ${state.activeCategory}`;
  }

  if (els.emptyState) {
    els.emptyState.hidden = visibleCoupons.length > 0;
    if (els.emptyStateMessage) {
      els.emptyStateMessage.textContent = isSearching
        ? `No coupons found matching "${state.search.trim()}". Check your spelling or browse categories.`
        : "Try a different search term or clear the active category filter.";
    }
  }
}

function couponCard(coupon) {
  return `
    <article class="coupon-card theme-${escapeHtml(coupon.theme)}">
      <div class="coupon-visual" ${headerStyle(coupon)}>
        ${ratingPill(coupon)}
        ${logoMarkup(coupon, "floating-logo")}
      </div>
      <div class="coupon-content">
        <h3><a href="products/${slugify(coupon.title)}.html" class="coupon-link">${escapeHtml(coupon.title)}</a></h3>
        <p class="category-label">${escapeHtml(coupon.category)}</p>
        <div class="ticket-mini code-slide-small">
          <strong>${escapeHtml(getOfferLine(coupon.title))}</strong>
          <span>${escapeHtml(shortenDescription(coupon.description, 56))}</span>
        </div>
        <div class="left-pill"><span>🎟</span> <b data-left-id="${escapeHtml(coupon.id)}">${Number(coupon.couponsLeft)}</b> coupons left
          <div class="offer-prompt${Number(coupon.couponsLeft) < 20 ? " is-next-step" : ""}" data-prompt-id="${escapeHtml(coupon.id)}" ${Number(coupon.couponsLeft) >= 30 ? "hidden" : ""}>${offerPrompt(coupon.couponsLeft)}</div>
        </div>
        <button class="get-code animated-cta" type="button" data-coupon-id="${escapeHtml(coupon.id)}">✂ Get Code</button>
        <div class="coupon-footer"><span>◷ ${escapeHtml(coupon.expiresLabel)}</span><span>♚ ${Number(coupon.usedToday)} uses today</span></div>
      </div>
    </article>
  `;
}

function bindCouponButtons(scope) {
  scope.querySelectorAll("[data-coupon-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const coupon = state.coupons.find((item) => item.id === button.dataset.couponId);
      if (coupon) queueCouponOpen(coupon);
    });
  });
}

function queueCouponOpen(coupon) {
  clearTimeout(state.loaderTimer);
  els.body.classList.add("is-loading-coupon");
  state.loaderTimer = window.setTimeout(() => {
    els.body.classList.remove("is-loading-coupon");
    openCoupon(coupon);
  }, 620);
}

function openCoupon(coupon) {
  state.selectedCoupon = coupon;
  state.remainingSeconds = state.lockSeconds;
  state.progressPercent = 0;
  clearTimers();
  setModalState("details");
  if (els.stateReady) els.stateReady.classList.remove("is-waiting-unlock");
  if (els.lockerButton) els.lockerButton.hidden = false;
  if (els.waitingInline) els.waitingInline.classList.remove("is-visible");

  if (els.modalHero) {
    els.modalHero.className = `modal-hero theme-${coupon.theme}`;
    els.modalHero.style.backgroundImage = coupon.headerImage ? `linear-gradient(180deg, rgba(6,10,17,.38), rgba(16,23,34,.66)), url("${assetPath(coupon.headerImage)}")` : "";
  }
  if (els.modalIcon) {
    els.modalIcon.className = `modal-icon theme-${coupon.theme}`;
    els.modalIcon.innerHTML = logoContent(coupon);
  }
  if (els.modalCategory) els.modalCategory.textContent = coupon.category;
  if (els.modalTitle) els.modalTitle.textContent = coupon.title;
  if (els.modalLeftCount) els.modalLeftCount.textContent = Number(coupon.couponsLeft);
  updateOfferPrompts(coupon);
  if (els.ticketTitle) els.ticketTitle.textContent = getOfferLine(coupon.title);
  if (els.ticketSubtitle) els.ticketSubtitle.textContent = "Limited Promotional offer";
  if (els.modalRating) els.modalRating.textContent = coupon.rating;
  if (els.modalUsedToday) els.modalUsedToday.textContent = Number(coupon.usedToday);
  if (els.modalExpires) els.modalExpires.textContent = `${Number(coupon.expiresDays)} Days`;
  if (els.modalDescription) els.modalDescription.textContent = coupon.description;
  if (els.modalPreviewCode) els.modalPreviewCode.textContent = coupon.maskedCode || maskCode(coupon.previewCode);
  if (els.lockedPreviewCode) els.lockedPreviewCode.textContent = coupon.maskedCode || maskCode(coupon.previewCode);
  updateTimers();

  if (els.modal) {
    els.modal.classList.add("is-open");
    els.modal.setAttribute("aria-hidden", "false");
    const modalPanel = els.modal.querySelector(".modal-panel");
    if (modalPanel) modalPanel.scrollTop = 0;
  }
  document.body.style.overflow = "hidden";
  window.requestAnimationFrame(syncRevealButton);
  window.setTimeout(syncRevealButton, 80);
  startCouponLeftAnimation();
}

function closeModal() {
  clearTimers();
  clearTimeout(state.loaderTimer);
  els.body.classList.remove("is-loading-coupon");
  if (els.modal) {
    els.modal.classList.remove("is-open");
    els.modal.setAttribute("aria-hidden", "true");
  }
  document.body.style.overflow = "";
  if (els.startReveal) {
    els.startReveal.style.removeProperty("--fixed-button-left");
    els.startReveal.style.removeProperty("--fixed-button-width");
  }
  state.selectedCoupon = null;
}

function syncRevealButton() {
  if (!els.startReveal) return;
  els.startReveal.style.removeProperty("--fixed-button-left");
  els.startReveal.style.removeProperty("--fixed-button-width");
}

function setModalState(name) {
  if (els.stateDetails) els.stateDetails.classList.toggle("is-active", name === "details");
  if (els.stateProgress) els.stateProgress.classList.toggle("is-active", name === "progress");
  if (els.stateReady) els.stateReady.classList.toggle("is-active", name === "ready");
  window.requestAnimationFrame(syncRevealButton);
}

function startRevealFlow() {
  setModalState("progress");
  state.progressPercent = 0;
  setProgress(0, "Preparing coupon...");
  clearProgressTimer();

  state.progressTimer = window.setInterval(() => {
    state.progressPercent += 1;
    const message = progressMessageFor(state.progressPercent);
    setProgress(state.progressPercent, message);

    if (state.progressPercent >= 100) {
      clearProgressTimer();
      startCountdown();
      window.setTimeout(() => setModalState("ready"), 450);
    }
  }, 45);
}

function progressMessageFor(percent) {
  let current = progressTextByPercent[0][1];
  for (const [step, message] of progressTextByPercent) {
    if (percent >= step) current = message;
  }
  return current;
}

function setProgress(percent, message) {
  const value = Math.max(0, Math.min(100, Number(percent)));
  if (els.progressRing) els.progressRing.style.setProperty("--progress", value);
  if (els.progressValue) els.progressValue.textContent = `${value}%`;
  if (els.progressMessage) {
    if (els.progressMessage.textContent !== message) {
      els.progressMessage.classList.remove("message-pop");
      void els.progressMessage.offsetWidth;
      els.progressMessage.classList.add("message-pop");
    }
    els.progressMessage.textContent = message;
  }
}

function startCountdown() {
  clearCountdownTimer();
  updateTimers();
  state.countdownTimer = window.setInterval(() => {
    state.remainingSeconds = Math.max(0, state.remainingSeconds - 1);
    updateTimers();
    if (state.remainingSeconds <= 0) clearCountdownTimer();
  }, 1000);
}

function updateTimers() {
  if (els.readyTimer) els.readyTimer.textContent = formatTime(state.remainingSeconds);
}

function openLockerAndWait() {
  if (!state.selectedCoupon?.lockerUrl) return;
  const url = buildLockerUrl(state.selectedCoupon.lockerUrl, state.selectedCoupon.title);
  window.open(url, "_blank");
  if (!state.countdownTimer) startCountdown();
  if (els.stateReady) els.stateReady.classList.add("is-waiting-unlock");
  if (els.lockerButton) els.lockerButton.hidden = true;
  if (els.waitingInline) els.waitingInline.classList.add("is-visible");
}

function startCouponLeftAnimation() {
  clearLeftTimer();
  const scheduleDecrease = () => {
    if (!state.selectedCoupon) return;
    const current = Number(state.selectedCoupon.couponsLeft);
    if (current <= 6) return;

    const [minDelay, maxDelay, minDrop, maxDrop] = current > 60
      ? [3000, 5000, 2, 4]
      : current > 30
        ? [5000, 8000, 1, 3]
        : current > 15
          ? [12000, 20000, 1, 1]
          : [30000, 50000, 1, 1];
    const delay = minDelay + Math.floor(Math.random() * (maxDelay - minDelay + 1));

    state.leftTimer = window.setTimeout(() => {
      state.leftTimer = null;
      if (!state.selectedCoupon) return;
      const decreaseBy = minDrop + Math.floor(Math.random() * (maxDrop - minDrop + 1));
      state.selectedCoupon.couponsLeft = Math.max(6, Number(state.selectedCoupon.couponsLeft) - decreaseBy);
      pulseLeftNumbers(state.selectedCoupon);
      scheduleDecrease();
    }, delay);
  };
  scheduleDecrease();
}

function pulseLeftNumbers(coupon) {
  updateOfferPrompts(coupon);
  if (els.modalLeftCount) {
    els.modalLeftCount.textContent = coupon.couponsLeft;
    els.modalLeftCount.classList.remove("pop-number");
    void els.modalLeftCount.offsetWidth;
    els.modalLeftCount.classList.add("pop-number");
  }

  document.querySelectorAll(`[data-left-id="${cssEscape(coupon.id)}"]`).forEach((item) => {
    item.textContent = coupon.couponsLeft;
    item.classList.remove("pop-number");
    void item.offsetWidth;
    item.classList.add("pop-number");
  });
}

function offerPrompt(quantity) {
  if (Number(quantity) < 10) return "🚨 Last few codes!";
  if (Number(quantity) < 20) return "⚡ Almost gone!";
  if (Number(quantity) < 30) return "🔥 Going fast!";
  return "";
}

function updateOfferPrompts(coupon) {
  const text = offerPrompt(coupon.couponsLeft);
  const prompts = [...document.querySelectorAll(`[data-prompt-id="${cssEscape(coupon.id)}"]`)];
  if (state.selectedCoupon?.id === coupon.id && els.modalOfferPrompt) prompts.push(els.modalOfferPrompt);
  prompts.forEach((prompt) => {
    prompt.hidden = !text;
    if (prompt.textContent !== text) prompt.textContent = text;
    prompt.classList.toggle("is-next-step", Number(coupon.couponsLeft) < 20);
  });
}

function slideNewest(direction) {
  if (!els.newestSlider) return;
  const amount = Math.min(360, els.newestSlider.clientWidth * 0.82);
  els.newestSlider.scrollBy({ left: direction * amount, behavior: "smooth" });
}

function clearTimers() {
  clearProgressTimer();
  clearCountdownTimer();
  clearLeftTimer();
}
function clearProgressTimer() {
  if (state.progressTimer) window.clearInterval(state.progressTimer);
  state.progressTimer = null;
}
function clearCountdownTimer() {
  if (state.countdownTimer) window.clearInterval(state.countdownTimer);
  state.countdownTimer = null;
}
function clearLeftTimer() {
  if (state.leftTimer) window.clearTimeout(state.leftTimer);
  state.leftTimer = null;
}

function buildLockerUrl(base, couponTitle) {
  try {
    const url = new URL(base, window.location.href);
    url.searchParams.set("name", couponTitle);
    return url.toString();
  } catch (error) {
    const joiner = base.includes("?") ? "&" : "?";
    return `${base}${joiner}name=${encodeURIComponent(couponTitle)}`;
  }
}

function getOfferLine(title) {
  return title
    .replace(/Free /i, "")
    .replace(/Paramount Plus/i, "Paramount+")
    .slice(0, 34);
}

function shortenDescription(text, limit = 58) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  return clean.length > limit ? `${clean.slice(0, limit - 2)}...` : clean;
}

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function headerStyle(coupon) {
  return coupon.headerImage ? `style="background-image: linear-gradient(180deg, rgba(7,11,19,.08), rgba(7,11,19,.18)), url('${assetPath(coupon.headerImage)}')"` : "";
}

function logoMarkup(coupon, className) {
  return `<div class="${className}">${logoContent(coupon)}</div>`;
}

function logoContent(coupon) {
  if (coupon.logoImage) {
    return `<img src="${assetPath(coupon.logoImage)}" alt="${escapeHtml(coupon.title)} verified discount coupon logo" loading="lazy">`;
  }
  return escapeHtml(coupon.initials);
}

function ratingPill(coupon) {
  return `<span class="rating-pill">★ ${escapeHtml(coupon.rating)}</span>`;
}

function assetPath(relativePath) {
  return `assets/${String(relativePath).replace(/^assets\//, "")}`;
}

function maskCode(code) {
  const clean = String(code || "YCBOX0000").slice(0, 10);
  return `${"*".repeat(Math.max(0, clean.length - 4))}${clean.slice(-4)}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function cssEscape(value) {
  if (window.CSS && CSS.escape) return CSS.escape(value);
  return String(value).replace(/[^a-zA-Z0-9_-]/g, "\\$&");
}

function applyMobileOnlyLock() {
  document.body.classList.remove("desktop-blocked");
  const lock = document.getElementById("desktop-lock");
  if (lock) lock.style.display = "none";
}

applyMobileOnlyLock();
window.addEventListener("resize", applyMobileOnlyLock);
window.addEventListener("orientationchange", applyMobileOnlyLock);