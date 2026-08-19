// Progresión del jugador: XP acumulada, nivel y desbloqueos. Todo local (sin datos personales), ver §20/§21.
const PROFILE_KEY = "chispamental:profile:v1";
const XP_PER_LEVEL = 100;

function loadProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    /* localStorage no disponible o corrupto: empezar de cero */
  }
  return { xp: 0, stats: {}, skills: {} };
}

function saveProfile(p) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}

export function getProfile() {
  return loadProfile();
}

export function levelFromXp(xp) {
  return 1 + Math.floor(xp / XP_PER_LEVEL);
}

export function xpProgress(xp) {
  const level = levelFromXp(xp);
  const into = xp - (level - 1) * XP_PER_LEVEL;
  return { level, into, needed: XP_PER_LEVEL, pct: Math.round((into / XP_PER_LEVEL) * 100) };
}

// Registra un intento: objective_id conceptual (modo+dificultad), correct/total, y XP ganada.
// Estructura preparada para §21 (mastery) sin implementar analítica pesada todavía.
export function recordAttempt({ mode, difficulty, correct, total, xpGained }) {
  const p = loadProfile();
  const beforeLevel = levelFromXp(p.xp);
  p.xp += xpGained;
  const afterLevel = levelFromXp(p.xp);

  const objectiveId = `${mode}:${difficulty}`;
  const s = p.stats[objectiveId] || { attempts: 0, successes: 0, errors: 0 };
  s.attempts += 1;
  s.successes += correct;
  s.errors += Math.max(0, total - correct);
  p.stats[objectiveId] = s;

  saveProfile(p);
  return { profile: p, leveledUp: afterLevel > beforeLevel, level: afterLevel };
}

// ---- Modelo de dominio por habilidad (§ sistema adaptativo) ----
// skillKey: p.ej. "math:+", "trivia:Lenguaje" — granularidad fina dentro de un modo.
export function recordSkill(mode, skillKey, isCorrect) {
  if (!skillKey) return;
  const p = loadProfile();
  if (!p.skills) p.skills = {};
  const id = `${mode}:${skillKey}`;
  const s = p.skills[id] || { attempts: 0, successes: 0 };
  s.attempts += 1;
  if (isCorrect) s.successes += 1;
  p.skills[id] = s;
  saveProfile(p);
}

// Devuelve la habilidad más débil de un modo con suficientes muestras para ser confiable,
// o null si no hay datos suficientes todavía. No es un diagnóstico clínico — solo adapta contenido.
export function getWeakSkill(mode, minAttempts = 4) {
  const p = loadProfile();
  const skills = p.skills || {};
  let weakest = null;
  for (const id in skills) {
    if (!id.startsWith(`${mode}:`)) continue;
    const s = skills[id];
    if (s.attempts < minAttempts) continue;
    const acc = s.successes / s.attempts;
    if (acc < 0.6 && (!weakest || acc < weakest.acc)) {
      weakest = { key: id.slice(mode.length + 1), acc };
    }
  }
  return weakest;
}

// Sugerencia de banda (no forzada): si el desempeño fue muy alto/bajo, propone subir/bajar.
export function suggestBandChange(currentBand, accuracy) {
  const order = ["facil", "medio", "dificil"];
  const idx = order.indexOf(currentBand);
  if (accuracy >= 0.9 && idx < order.length - 1) return { direction: "up", band: order[idx + 1] };
  if (accuracy <= 0.35 && idx > 0) return { direction: "down", band: order[idx - 1] };
  return null;
}

// ---- Misión diaria: ritual de retorno, no un contador de tiempo de pantalla ----
const DAILY_KEY = "chispamental:daily:v1";
const DAILY_XP_BONUS = 15;

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function loadDaily() {
  try {
    const raw = localStorage.getItem(DAILY_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { lastCompleted: null, streak: 0 };
}

export function getDailyStatus() {
  const d = loadDaily();
  return { completedToday: d.lastCompleted === todayStr(), streak: d.streak || 0 };
}

// Se llama al terminar cualquier ronda. Devuelve xpBonus>0 solo la primera vez del día.
export function claimDaily() {
  const d = loadDaily();
  const today = todayStr();
  if (d.lastCompleted === today) return { xpBonus: 0, streak: d.streak, isNew: false };

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  d.streak = d.lastCompleted === yesterday ? (d.streak || 0) + 1 : 1;
  d.lastCompleted = today;
  localStorage.setItem(DAILY_KEY, JSON.stringify(d));

  const p = loadProfile();
  p.xp += DAILY_XP_BONUS;
  saveProfile(p);

  return { xpBonus: DAILY_XP_BONUS, streak: d.streak, isNew: true };
}

export function getBest(mode, difficulty) {
  return Number(localStorage.getItem(`chispamental:best:${mode}:${difficulty}`) || 0);
}

export function setBestIfRecord(mode, difficulty, score) {
  const key = `chispamental:best:${mode}:${difficulty}`;
  const prev = Number(localStorage.getItem(key) || 0);
  if (score > prev) {
    localStorage.setItem(key, String(score));
    return { isRecord: true, prev };
  }
  return { isRecord: false, prev };
}
