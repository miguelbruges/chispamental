// Chispi 2.0 — híbrido Futurista + Abstracto: cuerpo redondo (tierno) + núcleo de
// energía que pulsa, ojos-pantalla, antena-chispa con vida propia (no decorativa).
export const SKINS = [
  { minLevel: 1, name: "Chispi clásico", color: "#ff9d2e", color2: "#f07d00", core: "#fff3c4" },
  { minLevel: 3, name: "Chispi turquesa", color: "#00c2a8", color2: "#00998a", core: "#c8fff2" },
  { minLevel: 5, name: "Chispi violeta", color: "#8b7bf0", color2: "#6c5ce7", core: "#e6dcff" },
  { minLevel: 8, name: "Chispi dorado", color: "#ffd23f", color2: "#e6b800", core: "#fffbe0" },
];

export function skinForLevel(level) {
  let best = SKINS[0];
  for (const s of SKINS) if (level >= s.minLevel) best = s;
  return best;
}

export const PHRASES = {
  correct: ["¡Eso es!", "¡Chispa activada!", "¡Así se hace!", "¡Genial!", "¡Lo lograste!"],
  wrong: ["¡Casi!", "Intentemos de nuevo", "¡Tú puedes!", "Vamos con la siguiente"],
  win: ["¡Excelente chispa! ⚡", "¡Misión cumplida!", "¡Lo dominaste!", "¡Increíble trabajo!"],
  okay: ["¡Buen intento!", "Vas mejorando", "¡Sigue así!"],
  lose: ["Sigue practicando", "La próxima será mejor", "¡No te rindas!"],
  poke: ["¡Jeje, eso cosquillea!", "¿Vamos a jugar?", "¡Hola! 👋", "¡Bip bip!", "¿Ya elegiste misión?"],
  dizzy: ["¡Uy, mareo de chispas!", "¡Wiii otra vez!"],
};

export function randomPhrase(key) {
  const list = PHRASES[key] || ["¡Bien!"];
  return list[Math.floor(Math.random() * list.length)];
}

// cejas, ojos (forma+pupila), boca, brazos, ángulo de antena.
const MOODS = {
  idle: { brow: "", eye: "screen", pupilY: 0, mouth: "M 38 66 Q 50 72 62 66", armL: "M 24 58 Q 12 64 14 76", armR: "M 76 58 Q 88 64 86 76", antenna: 0 },
  happy: { brow: "M 32 40 Q 38 34 44 40 M 56 40 Q 62 34 68 40", eye: "squint", pupilY: 0, mouth: "M 32 62 Q 50 84 68 62 Q 50 72 32 62", armL: "M 24 56 Q 8 46 10 30", armR: "M 76 56 Q 92 46 90 30", antenna: -8 },
  sad: { brow: "M 33 38 Q 40 44 46 40 M 54 40 Q 60 44 67 38", eye: "screen", pupilY: 3, mouth: "M 38 72 Q 50 62 62 72", armL: "M 24 58 Q 18 72 26 82", armR: "M 76 58 Q 82 72 74 82", antenna: 22 },
  surprised: { brow: "M 32 36 Q 38 30 44 36 M 56 36 Q 62 30 68 36", eye: "wide", pupilY: 0, mouth: "M 44 64 a 6 7 0 1 0 12 0 a 6 7 0 1 0 -12 0", armL: "M 24 56 Q 14 50 12 38", armR: "M 76 56 Q 86 50 88 38", antenna: -18 },
  thinking: { brow: "M 32 38 L 46 35 M 54 40 Q 61 38 68 40", eye: "screen", pupilY: -2, pupilX: 3, mouth: "M 40 68 Q 50 65 60 69", armL: "M 24 58 Q 12 64 14 76", armR: "M 76 54 Q 84 44 78 34", antenna: 12 },
  dizzy: { brow: "M 32 40 Q 38 36 44 40 M 56 40 Q 62 36 68 40", eye: "spiral", pupilY: 0, mouth: "M 40 68 Q 50 64 60 68", armL: "M 24 56 Q 10 60 12 72", armR: "M 76 56 Q 90 60 88 72", antenna: -25 },
};

function eyeShape(kind, cx, pupilY, pupilX) {
  const py = 46 + pupilY;
  const px = cx + pupilX;
  if (kind === "squint") {
    return `<path d="M ${cx - 8} 46 Q ${cx} 38 ${cx + 8} 46" fill="none" stroke="#2b2350" stroke-width="4" stroke-linecap="round" />`;
  }
  if (kind === "spiral") {
    return `<circle cx="${cx}" cy="46" r="8.5" fill="#ffffff" /><path d="M ${cx} 46 m -4 0 a 4 4 0 1 1 8 0 a 2.3 2.3 0 1 1 -4.6 0" fill="none" stroke="#2b2350" stroke-width="1.6" />`;
  }
  const r = kind === "wide" ? 10 : 8.5;
  const rx = r, ry = r * 0.92;
  const pr = kind === "wide" ? 5 : 4.2;
  return `
    <rect x="${cx - rx}" y="${46 - ry}" width="${rx * 2}" height="${ry * 2}" rx="6" fill="#1c1a3f" />
    <rect class="pupil" x="${px - pr / 2}" y="${py - pr / 2}" width="${pr}" height="${pr}" rx="1.4" fill="#8ff0ff" />`;
}

export function mascotSVG({ mood = "idle", color = "#ff9d2e", color2 = "#f07d00", core = "#fff3c4", size = 96 } = {}) {
  const m = MOODS[mood] || MOODS.idle;
  const pupilX = m.pupilX || 0;

  return `
  <svg class="mascot ${mood}" viewBox="0 0 100 100" width="${size}" height="${size}" role="img" aria-label="Chispi, la mascota de Chispamental">
    <ellipse class="ground-shadow" cx="50" cy="90" rx="26" ry="5" fill="rgba(43,35,80,0.14)" />

    <g class="motes">
      <circle class="mote mote-1" cx="18" cy="30" r="1.6" fill="${core}" />
      <circle class="mote mote-2" cx="84" cy="24" r="1.3" fill="${core}" />
      <circle class="mote mote-3" cx="80" cy="66" r="1.4" fill="${core}" />
    </g>

    <path class="arm" d="${m.armL}" fill="none" stroke="${color2}" stroke-width="7" stroke-linecap="round" />
    <path class="arm" d="${m.armR}" fill="none" stroke="${color2}" stroke-width="7" stroke-linecap="round" />

    <g class="antenna" style="transform-origin:50px 20px; transform:rotate(${m.antenna}deg)">
      <path d="M 50 20 L 50 6" fill="none" stroke="${color2}" stroke-width="3" stroke-linecap="round" />
      <circle class="antenna-tip" cx="50" cy="5" r="4" fill="${core}" />
    </g>

    <path class="body" d="M 50 18 C 68 18 80 34 80 54 C 80 76 66 90 50 90 C 34 90 20 76 20 54 C 20 34 32 18 50 18 Z"
      fill="${color}" stroke="${color2}" stroke-width="3" stroke-linejoin="round" />

    <path class="core" d="M 50 58 L 57 66 L 50 74 L 43 66 Z" fill="${core}" opacity="0.9" />

    <ellipse cx="30" cy="60" rx="7" ry="4.5" fill="#ff6f6f" opacity="0.4" />
    <ellipse cx="70" cy="60" rx="7" ry="4.5" fill="#ff6f6f" opacity="0.4" />

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

// ---- Seguimiento de mirada estilo Talking Tom: las pupilas siguen el puntero ----
let eyeTrackingEnabled = false;
export function enableEyeTracking() {
  if (eyeTrackingEnabled || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  eyeTrackingEnabled = true;

  function update(clientX, clientY) {
    document.querySelectorAll(".mascot").forEach((svg) => {
      const rect = svg.getBoundingClientRect();
      if (!rect.width) return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const angle = Math.atan2(clientY - cy, clientX - cx);
      const dist = Math.min(1, Math.hypot(clientX - cx, clientY - cy) / 400);
      const dx = Math.cos(angle) * dist * 1.6;
      const dy = Math.sin(angle) * dist * 1.6;
      svg.querySelectorAll(".pupil").forEach((p) => {
        p.style.transformBox = "fill-box";
        p.style.transformOrigin = "center";
        p.style.transform = `translate(${dx}px, ${dy}px)`;
      });
    });
  }

  window.addEventListener("pointermove", (e) => update(e.clientX, e.clientY), { passive: true });
}

// ---- Interactividad estilo "mascota viva" (tocar reacciona, parpadea sola en reposo) ----
export function makeInteractive(el, getSkin, onSpeak) {
  if (!el) return;
  let tapCount = 0;
  let tapTimer = null;
  let idleHandle = null;
  let reacting = false;

  function scheduleIdle() {
    clearTimeout(idleHandle);
    idleHandle = setTimeout(() => {
      if (!reacting) {
        el.classList.add("blink");
        setTimeout(() => el.classList.remove("blink"), 140);
      }
      scheduleIdle();
    }, 4000 + Math.random() * 4000);
  }

  el.style.cursor = "pointer";
  el.addEventListener("click", () => {
    tapCount++;
    clearTimeout(tapTimer);
    tapTimer = setTimeout(() => (tapCount = 0), 900);

    const skin = getSkin();
    const dizzy = tapCount >= 4;
    reacting = true;
    renderMascot(el, { mood: dizzy ? "dizzy" : "happy", ...skin });
    if (onSpeak) onSpeak(randomPhrase(dizzy ? "dizzy" : "poke"));

    setTimeout(() => {
      renderMascot(el, { mood: "idle", ...skin });
      reacting = false;
    }, dizzy ? 900 : 500);
  });

  scheduleIdle();
}
