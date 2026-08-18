// Chispi — mascota de Chispamental. Un SVG simple con estados de ánimo y color desbloqueable.
export const SKINS = [
  { minLevel: 1, name: "Chispi clásico", color: "#ff9d2e", color2: "#f07d00" },
  { minLevel: 3, name: "Chispi turquesa", color: "#00c2a8", color2: "#00998a" },
  { minLevel: 5, name: "Chispi violeta", color: "#8b7bf0", color2: "#6c5ce7" },
  { minLevel: 8, name: "Chispi dorado", color: "#ffd23f", color2: "#e6b800" },
];

export function skinForLevel(level) {
  let best = SKINS[0];
  for (const s of SKINS) if (level >= s.minLevel) best = s;
  return best;
}

const MOUTHS = {
  idle: "M 34 62 Q 48 70 62 62",
  happy: "M 30 58 Q 48 78 66 58 Q 48 66 30 58",
  sad: "M 34 68 Q 48 56 62 68",
};

export function mascotSVG({ mood = "idle", color = "#ff9d2e", color2 = "#f07d00", size = 96 } = {}) {
  const mouth = MOUTHS[mood] || MOUTHS.idle;
  const eyeH = mood === "happy" ? 3 : 8;
  return `
  <svg class="mascot ${mood}" viewBox="0 0 96 96" width="${size}" height="${size}" role="img" aria-label="Chispi, la mascota de Chispamental">
    <ellipse cx="48" cy="86" rx="26" ry="6" fill="rgba(43,35,80,0.08)" />
    <path class="body" d="M48 8 L64 40 L50 40 L60 78 L28 42 L42 42 Z" fill="${color}" stroke="${color2}" stroke-width="3" stroke-linejoin="round" />
    <circle cx="40" cy="46" r="5" fill="#2b2350" style="transform-origin:40px 46px" />
    <circle cx="58" cy="46" r="5" fill="#2b2350" />
    <rect x="37" y="${46 - eyeH / 2}" width="6" height="${eyeH}" rx="3" fill="#2b2350" />
    <rect x="55" y="${46 - eyeH / 2}" width="6" height="${eyeH}" rx="3" fill="#2b2350" />
    <path d="${mouth}" fill="none" stroke="#2b2350" stroke-width="3" stroke-linecap="round" />
  </svg>`;
}

export function renderMascot(el, opts) {
  if (!el) return;
  el.innerHTML = mascotSVG(opts);
}
