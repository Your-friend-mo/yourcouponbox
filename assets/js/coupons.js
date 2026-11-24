/**
 * Coupon dataset for Your Coupon Box clone.
 * Includes crisp inline SVG banners and brand icons so every card renders sharply offline.
 */

function makeSvgUri(svg) {
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg.trim());
}

function makeBanner(c1, c2, badgeText, subtitle) {
  return makeSvgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 300">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${c1}"/>
          <stop offset="100%" stop-color="${c2}"/>
        </linearGradient>
        <radialGradient id="glow" cx="82%" cy="22%" r="55%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.28)"/>
          <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
        </radialGradient>
      </defs>
      <rect width="600" height="300" fill="url(#bg)"/>
      <rect width="600" height="300" fill="url(#glow)"/>
      <circle cx="510" cy="60" r="110" fill="rgba(255,255,255,0.08)"/>
      <circle cx="90" cy="260" r="120" fill="rgba(0,0,0,0.16)"/>
      <text x="560" y="138" text-anchor="end" fill="rgba(255,255,255,0.95)" font-family="Inter,Segoe UI,sans-serif" font-size="44" font-weight="900" letter-spacing="-1.5">${badgeText}</text>
      <text x="560" y="176" text-anchor="end" fill="rgba(255,255,255,0.78)" font-family="Inter,Segoe UI,sans-serif" font-size="20" font-weight="700">${subtitle}</text>
    </svg>
  `);
}

function makeIcon(c1, c2, mark, textColor = "#ffffff") {
  return makeSvgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <defs>
        <linearGradient id="ig" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${c1}"/>
          <stop offset="100%" stop-color="${c2}"/>
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="26" fill="url(#ig)"/>
      <circle cx="96" cy="24" r="34" fill="rgba(255,255,255,0.12)"/>
      <text x="60" y="74" text-anchor="middle" fill="${textColor}" font-family="Inter,Segoe UI,sans-serif" font-size="42" font-weight="900" letter-spacing="-2">${mark}</text>
    </svg>
  `);
}

window.COUPON_CATEGORIES = [
  "All",
  "Streaming",
  "Gaming",
  "AI Tools",
  "Music",
  "Video Editing",
  "Software"
];

window.COUPONS_DATA = [
  {
    id: "netflix-premium",
    title: "Netflix Premium",
    category: "Streaming",
    isPopular: false,
    rating: 4.9,
    usedToday: 428,
    couponsLeft: 19,
    shortOffer: "Claim 12 months of Netflix 4K UHD!",
    description: "Unlock a promotional voucher for Netflix Premium with 4K Ultra HD streaming, spatial audio, and multi-device support.",
    previewCode: "NFX4K-2026-7YDZ",
    maskedCode: "******7YDZ",
    banner: makeBanner("#b91c1c", "#18181b", "NETFLIX", "4K UHD Premium"),
    icon: makeIcon("#e50914", "#8b0000", "N")
  },
  {
    id: "discord-nitro",
    title: "Discord Nitro",
    category: "Gaming",
    isPopular: false,
    rating: 4.8,
    usedToday: 365,
    couponsLeft: 24,
    shortOffer: "Claim 12 months of Discord Nitro!",
    description: "Upgrade your Discord profile with custom emojis, HD streaming, 2 server boosts, and larger file uploads.",
    previewCode: "NTRO-BOOST-9K4P",
    maskedCode: "******9K4P",
    banner: makeBanner("#5865F2", "#1e1b4b", "NITRO", "HD Stream + Boosts"),
    icon: makeIcon("#5865F2", "#3b44b5", "DN")
  },
  {
    id: "claude-pro",
    title: "Claude Pro",
    category: "AI Tools",
    isPopular: true,
    rating: 5.0,
    usedToday: 512,
    couponsLeft: 14,
    shortOffer: "Claim 12 months of Claude Pro.",
    description: "Get priority access to Claude Pro models, extended context windows, and faster coding and writing workflows.",
    previewCode: "CLDE-PRO26-4M8Q",
    maskedCode: "******4M8Q",
    banner: makeBanner("#d97757", "#2d1a14", "CLAUDE", "Pro AI Workspace"),
    icon: makeIcon("#e07a5f", "#a34a2e", "C")
  },
  {
    id: "spotify-premium",
    title: "Spotify Premium",
    category: "Music",
    isPopular: true,
    rating: 4.9,
    usedToday: 489,
    couponsLeft: 27,
    shortOffer: "Claim 12 months of Spotify Premium!",
    description: "Enjoy ad-free music listening, offline downloads, high-bitrate audio, and unlimited skips across all devices.",
    previewCode: "SPTF-PREM-8R2X",
    maskedCode: "******8R2X",
    banner: makeBanner("#1db954", "#0c2416", "SPOTIFY", "Ad-Free Hi-Fi"),
    icon: makeIcon("#1db954", "#12803a", "S", "#0b111b")
  },
  {
    id: "xbox-game-pass",
    title: "Xbox Game Pass Ultimate",
    category: "Gaming",
    isPopular: false,
    rating: 4.8,
    usedToday: 340,
    couponsLeft: 16,
    shortOffer: "12-Month Xbox Game Pass Ultimate Key",
    description: "Play hundreds of console, PC, and cloud games including day-one releases and EA Play membership.",
    previewCode: "XGPU-12MO-6W3V",
    maskedCode: "******6W3V",
    banner: makeBanner("#107c10", "#0b1f0e", "XBOX", "Game Pass Ultimate"),
    icon: makeIcon("#107c10", "#094f09", "XB")
  },
  {
    id: "sims-4-dlc",
    title: "The Sims 4 DLC Packs",
    category: "Gaming",
    isPopular: true,
    rating: 4.9,
    usedToday: 394,
    couponsLeft: 9,
    shortOffer: "Claim free Sims 4 all packs!",
    description: "Unlock expansion packs, game packs, and stuff packs for The Sims 4 with a single promotional bundle code.",
    previewCode: "SIMS4-ALL-5T9N",
    maskedCode: "******5T9N",
    banner: makeBanner("#0ea5e9", "#1e3a8a", "SIMS 4", "All Expansion Packs"),
    icon: makeIcon("#22c55e", "#0ea5e9", "S4")
  },
  {
    id: "youtube-premium",
    title: "Youtube Premium",
    category: "Streaming",
    isPopular: false,
    rating: 4.8,
    usedToday: 318,
    couponsLeft: 29,
    shortOffer: "Ad-Free YouTube + YouTube Music",
    description: "Watch videos without ads, play in the background, download for offline viewing, and get YouTube Music included.",
    previewCode: "YTPR-2026-3L7B",
    maskedCode: "******3L7B",
    banner: makeBanner("#dc2626", "#1f1215", "YOUTUBE", "Premium + Music"),
    icon: makeIcon("#ff0000", "#991b1b", "▶")
  },
  {
    id: "meccha-chameleon",
    title: "Meccha Chameleon Free Game Key",
    category: "Gaming",
    isPopular: false,
    rating: 4.7,
    usedToday: 215,
    couponsLeft: 18,
    shortOffer: "Claim your free Steam game key!",
    description: "Redeem a digital game key for Meccha Chameleon and jump straight into fast-paced arcade action.",
    previewCode: "MCHM-KEY-2C6J",
    maskedCode: "******2C6J",
    banner: makeBanner("#14b8a6", "#1e1b4b", "ARCADE", "Free Steam Key"),
    icon: makeIcon("#14b8a6", "#0f766e", "MC")
  },
  {
    id: "gemini-pro",
    title: "Gemini Pro",
    category: "AI Tools",
    isPopular: false,
    rating: 4.9,
    usedToday: 441,
    couponsLeft: 12,
    shortOffer: "Claim 12 months of Gemini Pro!",
    description: "Access Google's advanced Gemini models, deep research tools, and 2TB cloud storage perks.",
    previewCode: "GMNI-PRO-8H5F",
    maskedCode: "******8H5F",
    banner: makeBanner("#2563eb", "#312e81", "GEMINI", "Advanced AI Pro"),
    icon: makeIcon("#3b82f6", "#8b5cf6", "✦")
  },
  {
    id: "gta-6-free",
    title: "GTA 6 Free Game Code",
    category: "Gaming",
    isPopular: true,
    rating: 5.0,
    usedToday: 684,
    couponsLeft: 8,
    shortOffer: "Claim GTA 6 for Free.",
    description: "Reserve your promotional digital edition code for Grand Theft Auto VI on PlayStation, Xbox, or PC.",
    previewCode: "GTA6-VICE-7Z1K",
    maskedCode: "******7Z1K",
    banner: makeBanner("#ec4899", "#3b0764", "GTA VI", "Digital Edition"),
    icon: makeIcon("#f43f5e", "#f97316", "VI")
  },
  {
    id: "chatgpt-plus",
    title: "ChatGPT Plus",
    category: "AI Tools",
    isPopular: true,
    rating: 4.9,
    usedToday: 576,
    couponsLeft: 15,
    shortOffer: "Claim a ChatGPT Plus promo offer!",
    description: "Unlock faster responses, priority access to flagship reasoning models, image generation, and voice mode.",
    previewCode: "CGPT-PLUS-4V9D",
    maskedCode: "******4V9D",
    banner: makeBanner("#10a37f", "#0b241f", "CHATGPT", "Plus Membership"),
    icon: makeIcon("#10a37f", "#065f46", "AI")
  },
  {
    id: "capcut-pro",
    title: "CapCut Pro",
    category: "Video Editing",
    isPopular: false,
    rating: 4.8,
    usedToday: 297,
    couponsLeft: 21,
    shortOffer: "Unlock 12 months of CapCut Pro!",
    description: "Export 4K videos with zero watermarks, AI captions, pro transitions, and cloud asset storage.",
    previewCode: "CCUT-PRO-9N3M",
    maskedCode: "******9N3M",
    banner: makeBanner("#334155", "#0f172a", "CAPCUT", "Pro Video Suite"),
    icon: makeIcon("#f8fafc", "#cbd5e1", "CC", "#0f172a")
  },
  {
    id: "premiere-pro",
    title: "Adobe Premiere Pro",
    category: "Video Editing",
    isPopular: false,
    rating: 4.9,
    usedToday: 244,
    couponsLeft: 17,
    shortOffer: "Claim Creative Cloud Video Plan!",
    description: "Professional timeline editing, color grading, audio remixing, and After Effects dynamic link.",
    previewCode: "ADBE-PR26-6B8S",
    maskedCode: "******6B8S",
    banner: makeBanner("#4c1d95", "#1e1b4b", "PREMIERE", "Pro Editing Plan"),
    icon: makeIcon("#312e81", "#1e1b4b", "Pr", "#c4b5fd")
  },
  {
    id: "davinci-studio",
    title: "DaVinci Resolve Studio",
    category: "Video Editing",
    isPopular: false,
    rating: 4.8,
    usedToday: 168,
    couponsLeft: 26,
    shortOffer: "Studio License Activation Promo",
    description: "Unlock neural engine AI tools, 10-bit HDR grading, noise reduction, and Fusion VFX studio features.",
    previewCode: "DVNC-STD-5R4L",
    maskedCode: "******5R4L",
    banner: makeBanner("#0284c7", "#0f172a", "RESOLVE", "Studio License"),
    icon: makeIcon("#0ea5e9", "#f97316", "DR")
  },
  {
    id: "apple-music",
    title: "Apple Music",
    category: "Music",
    isPopular: false,
    rating: 4.8,
    usedToday: 263,
    couponsLeft: 32,
    shortOffer: "6 Months Free Lossless Audio!",
    description: "Stream over 100 million songs ad-free in Spatial Audio with Dolby Atmos and lossless quality.",
    previewCode: "APLM-6MO-2Q7W",
    maskedCode: "******2Q7W",
    banner: makeBanner("#fb7185", "#4c0519", "MUSIC", "Spatial + Lossless"),
    icon: makeIcon("#f43f5e", "#e11d48", "♫")
  },
  {
    id: "soundcloud-go",
    title: "SoundCloud Go+",
    category: "Music",
    isPopular: false,
    rating: 4.7,
    usedToday: 149,
    couponsLeft: 35,
    shortOffer: "Ad-Free Offline Listening Pass",
    description: "Save unlimited tracks offline, enjoy high-quality audio, and mix directly with DJ integrations.",
    previewCode: "SCGO-PLUS-8P1T",
    maskedCode: "******8P1T",
    banner: makeBanner("#f97316", "#431407", "SOUNDCLOUD", "Go+ Unlimited"),
    icon: makeIcon("#ff5500", "#c2410c", "SC")
  },
  {
    id: "disney-plus",
    title: "Disney+ Bundle",
    category: "Streaming",
    isPopular: false,
    rating: 4.8,
    usedToday: 286,
    couponsLeft: 22,
    shortOffer: "Claim 6 Months of Disney+ 4K",
    description: "Stream Marvel, Star Wars, Pixar, National Geographic, and Hulu originals in 4K Dolby Vision.",
    previewCode: "DSNY-4K-3X9H",
    maskedCode: "******3X9H",
    banner: makeBanner("#1d4ed8", "#0f172a", "DISNEY+", "4K Bundle Pass"),
    icon: makeIcon("#1e40af", "#0ea5e9", "D+")
  },
  {
    id: "crunchyroll-mega",
    title: "Crunchyroll Mega Fan",
    category: "Streaming",
    isPopular: false,
    rating: 4.9,
    usedToday: 234,
    couponsLeft: 19,
    shortOffer: "12 Months Ad-Free Anime Access",
    description: "Watch simulcast anime episodes one hour after Japan with offline viewing on up to 4 devices.",
    previewCode: "CRCH-MEGA-7K2M",
    maskedCode: "******7K2M",
    banner: makeBanner("#f97316", "#271408", "ANIME", "Mega Fan Tier"),
    icon: makeIcon("#f97316", "#ea580c", "CR")
  },
  {
    id: "canva-pro",
    title: "Canva Pro",
    category: "Software",
    isPopular: false,
    rating: 4.9,
    usedToday: 382,
    couponsLeft: 15,
    shortOffer: "Claim 12 Months of Canva Pro!",
    description: "Unlock Magic Resize, background remover, brand kits, and millions of premium stock templates.",
    previewCode: "CNVA-PRO-5J6R",
    maskedCode: "******5J6R",
    banner: makeBanner("#06b6d4", "#3b0764", "CANVA", "Pro Design Kit"),
    icon: makeIcon("#00c4cc", "#7d2ae8", "Ca")
  },
  {
    id: "nordvpn-complete",
    title: "NordVPN Complete",
    category: "Software",
    isPopular: false,
    rating: 4.8,
    usedToday: 271,
    couponsLeft: 28,
    shortOffer: "2-Year VPN + Password Manager",
    description: "Protect up to 10 devices with high-speed encrypted servers, threat protection, and cloud storage.",
    previewCode: "NORD-2YR-4D8P",
    maskedCode: "******4D8P",
    banner: makeBanner("#2563eb", "#0f172a", "NORDVPN", "2-Year Complete"),
    icon: makeIcon("#3b82f6", "#1d4ed8", "NV")
  },
  {
    id: "notion-plus",
    title: "Notion Plus + AI",
    category: "Software",
    isPopular: false,
    rating: 4.8,
    usedToday: 193,
    couponsLeft: 31,
    shortOffer: "12 Months Unlimited Workspace",
    description: "Organize docs, projects, and wikis with unlimited file uploads and built-in Notion AI writing.",
    previewCode: "NTN-PLUS-9C4E",
    maskedCode: "******9C4E",
    banner: makeBanner("#475569", "#0f172a", "NOTION", "Plus + AI Add-on"),
    icon: makeIcon("#f8fafc", "#e2e8f0", "N", "#0f172a")
  },
  {
    id: "midjourney-pro",
    title: "Midjourney Standard",
    category: "AI Tools",
    isPopular: false,
    rating: 4.9,
    usedToday: 329,
    couponsLeft: 11,
    shortOffer: "Fast GPU Hours Promo Voucher",
    description: "Generate photorealistic artwork, concept designs, and brand visuals with fast GPU priority.",
    previewCode: "MJRN-GPU-6T2V",
    maskedCode: "******6T2V",
    banner: makeBanner("#6366f1", "#0f172a", "MIDJOURNEY", "Fast GPU Plan"),
    icon: makeIcon("#4f46e5", "#1e1b4b", "MJ")
  }
];
