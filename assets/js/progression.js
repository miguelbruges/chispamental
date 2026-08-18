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
  return { xp: 0, stats: {} };
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
