// Chispi 2.0 — mascota de Chispamental.
// Diseño basado en investigación de percepción infantil: siluetas redondeadas/suaves
// generan mayor afecto y sensación de seguridad en niños (vs. formas angulares),
// ojos grandes + brillo + mejillas aumentan la "cuteness" percibida, y una
// característica visual única (el rayo en la cabeza) mejora el reconocimiento
// de marca a distancia y en tamaños pequeños.
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

// Frases contextuales de Chispi — variedad para evitar el "¡Muy bien!" repetitivo.
export const PHRASES = {
  correct: ["¡Eso es!", "¡Chispa activada!", "¡Así se hace!", "¡Genial!", "¡Lo lograste!"],
  wrong: ["¡Casi!", "Intentemos de nuevo", "¡Tú puedes!", "Vamos con la siguiente"],
  win: ["¡Excelente chispa! ⚡", "¡Misión cumplida!", "¡Lo dominaste!", "¡Increíble trabajo!"],
  okay: ["¡Buen intento!", "Vas mejorando", "¡Sigue así!"],
  lose: ["Sigue practicando", "La próxima será mejor", "¡No te rindas!"],
};

export function randomPhrase(key) {
  const list = PHRASES[key] || ["¡Bien!"];
  return list[Math.floor(Math.random() * list.length)];
}

// Cada estado define: cejas, ojos (forma + pupila), boca y brazos (rutas SVG).
const MOODS = {
  idle: {
    brow: "",
    eye: "round",
    pupilY: 0,
    mouth: "M 38 66 Q 50 72 62 66",
    armL: "M 24 58 Q 12 64 14 76",
    armR: "M 76 58 Q 88 64 86 76",
  },
  happy: {
    brow: "M 32 40 Q 38 34 44 40 M 56 40 Q 62 34 68 40",
    eye: "squint",
    pupilY: 0,
    mouth: "M 32 62 Q 50 84 68 62 Q 50 72 32 62",
    armL: "M 24 56 Q 8 46 10 30",
    armR: "M 76 56 Q 92 46 90 30",
  },
  sad: {
    brow: "M 33 38 Q 40 44 46 40 M 54 40 Q 60 44 67 38",
    eye: "round",
    pupilY: 3,
    mouth: "M 38 72 Q 50 62 62 72",
    armL: "M 24 58 Q 18 72 26 82",
    armR: "M 76 58 Q 82 72 74 82",
  },
  surprised: {
    brow: "M 32 36 Q 38 30 44 36 M 56 36 Q 62 30 68 36",
    eye: "wide",
    pupilY: 0,
    mouth: "M 44 64 a 6 7 0 1 0 12 0 a 6 7 0 1 0 -12 0",
    armL: "M 24 56 Q 14 50 12 38",
    armR: "M 76 56 Q 86 50 88 38",
  },
  thinking: {
    brow: "M 32 38 L 46 35 M 54 40 Q 61 38 68 40",
    eye: "round",
    pupilY: -2,
    pupilX: 3,
    mouth: "M 40 68 Q 50 65 60 69",
    armL: "M 24 58 Q 12 64 14 76",
    armR: "M 76 54 Q 84 44 78 34",
  },
};

function eyeShape(kind, cx, pupilY, pupilX) {
  const py = 46 + pupilY;
  const px = cx + pupilX;
  if (kind === "squint") {
    return `<path d="M ${cx - 8} 46 Q ${cx} 38 ${cx + 8} 46" fill="none" stroke="#2b2350" stroke-width="4" stroke-linecap="round" />`;
  }
  const r = kind === "wide" ? 10 : 8.5;
  const pr = kind === "wide" ? 5.5 : 4.5;
  return `
    <circle cx="${cx}" cy="46" r="${r}" fill="#ffffff" />
    <circle cx="${px}" cy="${py}" r="${pr}" fill="#2b2350" />
    <circle cx="${px - pr * 0.4}" cy="${py - pr * 0.4}" r="${pr * 0.3}" fill="#ffffff" />`;
}

export function mascotSVG({ mood = "idle", color = "#ff9d2e", color2 = "#f07d00", size = 96 } = {}) {
  const m = MOODS[mood] || MOODS.idle;
  const pupilX = m.pupilX || 0;

  return `
  <svg class="mascot ${mood}" viewBox="0 0 100 100" width="${size}" height="${size}" role="img" aria-label="Chispi, la mascota de Chispamental">
    <ellipse cx="50" cy="90" rx="26" ry="5" fill="rgba(43,35,80,0.10)" />

    <path class="arm" d="${m.armL}" fill="none" stroke="${color2}" stroke-width="7" stroke-linecap="round" />
    <path class="arm" d="${m.armR}" fill="none" stroke="${color2}" stroke-width="7" stroke-linecap="round" />

    <path class="spark-ear" d="M 46 20 L 50 4 L 54 14 L 60 2 L 55 20 Z" fill="${color2}" />

    <path class="body" d="M 50 18 C 68 18 80 34 80 54 C 80 76 66 90 50 90 C 34 90 20 76 20 54 C 20 34 32 18 50 18 Z"
      fill="${color}" stroke="${color2}" stroke-width="3" stroke-linejoin="round" />

    <ellipse cx="30" cy="60" rx="7" ry="4.5" fill="#ff6f6f" opacity="0.45" />
    <ellipse cx="70" cy="60" rx="7" ry="4.5" fill="#ff6f6f" opacity="0.45" />

    ${eyeShape(m.eye, 38, m.pupilY, pupilX)}
    ${eyeShape(m.eye, 62, m.pupilY, pupilX)}

    <path d="${m.brow}" fill="none" stroke="#2b2350" stroke-width="3" stroke-linecap="round" />
    <path d="${m.mouth}" fill="${mood === "happy" || mood === "surprised" ? "#c0392b" : "none"}" stroke="#2b2350" stroke-width="3" stroke-linecap="round" />
  </svg>`;
}

export function renderMascot(el, opts) {
  if (!el) return;
  el.innerHTML = mascotSVG(opts);
}
