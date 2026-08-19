import { TRIVIA } from "./content/questions.js";
import { genMathQuestion, genLogicQuestion, shuffle } from "./content/generators.js";
import { createQuizEngine } from "./engine/quiz.js";
import { createMemoryEngine } from "./engine/memory.js";
import { renderMascot, skinForLevel, randomPhrase, makeInteractive } from "./mascot.js";
import { getProfile, levelFromXp, xpProgress, recordAttempt, getBest, setBestIfRecord, recordSkill, getWeakSkill, suggestBandChange } from "./progression.js";

// Mundo Chispa: cada modo es una zona con identidad propia, no una materia de menú escolar.
const MODES = [
  {
    id: "math", icon: "🔢", name: "Valle Numérico", tag: "Matemática Rápida", desc: "Resuelve operaciones contra el reloj para cruzar el valle.",
    mission: "Chispi debe cruzar el Puente de los Números. Resuelve cada operación para avanzar un paso más.",
  },
  {
    id: "logic", icon: "🧩", name: "Isla de Acertijos", tag: "Lógica", desc: "Descubre el patrón para avanzar por la isla.",
    mission: "En la Isla de los Acertijos, Chispi necesita tu ayuda para descubrir qué sigue en cada sendero.",
  },
  {
    id: "trivia", icon: "📚", name: "Biblioteca Perdida", tag: "Trivia Escolar", desc: "Lenguaje, ciencias, geografía e historia.",
    mission: "¡Bienvenido a la Biblioteca Perdida! Responde bien para desbloquear cada estante de sabiduría.",
  },
  {
    id: "memory", icon: "🧠", name: "Ciudad Cerebro", tag: "Memoria", desc: "Encuentra las parejas y reactiva la ciudad.",
    mission: "Ciudad Cerebro perdió sus luces. Encuentra las parejas escondidas para reactivarlas.",
  },
];

// Bandas de dificultad = bandas de edad/grado (§12). facil/medio/dificil se mantienen como IDs internos
// por compatibilidad con el contenido existente (questions.js, récords guardados).
const BANDS = {
  facil: { id: "facil", name: "Explorador", grade: "1°–2° · 6–7 años", questionSeconds: 20, questions: 10, mathRange: 10, mathOps: ["+", "-"], memoryPairs: 6, memoryCols: 4, logicMax: 3 },
  medio: { id: "medio", name: "Aventurero", grade: "3° · 8–9 años", questionSeconds: 15, questions: 10, mathRange: 20, mathOps: ["+", "-", "×"], memoryPairs: 8, memoryCols: 4, logicMax: 6 },
  dificil: { id: "dificil", name: "Experto", grade: "4°–5° · 10–11 años", questionSeconds: 10, questions: 10, mathRange: 50, mathOps: ["+", "-", "×", "÷"], memoryPairs: 10, memoryCols: 5, logicMax: 10 },
};

const $ = (id) => document.getElementById(id);

const state = { mode: "math", band: "facil", score: 0, streak: 0 };

// ---------- Perfil / mascota ----------

let homeInteractiveReady = false;

function renderProfile() {
  const profile = getProfile();
  const { level, into, needed, pct } = xpProgress(profile.xp);
  const skin = skinForLevel(level);
  $("profile-level").textContent = level;
  $("profile-skin").textContent = skin.name;
  $("xp-bar").style.width = `${pct}%`;
  $("xp-label").textContent = `${into} / ${needed} XP`;
  renderMascot($("mascot-home"), { mood: "idle", color: skin.color, color2: skin.color2, core: skin.core, size: 84 });

  if (!homeInteractiveReady) {
    homeInteractiveReady = true;
    makeInteractive($("mascot-home"), () => skinForLevel(levelFromXp(getProfile().xp)), (line) => {
      const bubble = $("home-speech");
      bubble.textContent = line;
      bubble.classList.add("show");
      clearTimeout(bubble._hideTimer);
      bubble._hideTimer = setTimeout(() => bubble.classList.remove("show"), 1400);
    });
  }
}

// ---------- Home ----------

function renderModeGrid() {
  const grid = $("mode-grid");
  grid.innerHTML = "";
  MODES.forEach((m) => {
    const btn = document.createElement("button");
    btn.className = "mode-card" + (m.id === state.mode ? " active" : "");
    btn.innerHTML = `<span class="icon">${m.icon}</span><span class="zone-tag">${m.tag}</span><span class="name">${m.name}</span><span class="desc">${m.desc}</span>`;
    btn.addEventListener("click", () => {
      state.mode = m.id;
      renderModeGrid();
      renderBestScore();
    });
    grid.appendChild(btn);
  });
}

function renderBandGrid() {
  const grid = $("band-grid");
  grid.innerHTML = "";
  Object.values(BANDS).forEach((b) => {
    const btn = document.createElement("button");
    btn.className = "band-btn" + (b.id === state.band ? " active" : "");
    btn.innerHTML = `<span class="band-name">${b.name}</span><span class="band-grade">${b.grade}</span>`;
    btn.addEventListener("click", () => {
      state.band = b.id;
      renderBandGrid();
      renderBestScore();
    });
    grid.appendChild(btn);
  });
}

function renderBestScore() {
  const val = getBest(state.mode, state.band);
  $("best-score").textContent = val ? `Mejor puntaje: ${val}` : "Aún sin récord en este modo/nivel";
}

function wireHome() {
  renderModeGrid();
  renderBandGrid();
  renderBestScore();
  renderProfile();

  $("btn-play").addEventListener("click", showMission);
  $("btn-start-mission").addEventListener("click", startGame);
  $("btn-home").addEventListener("click", () => showScreen("home"));
  $("btn-menu").addEventListener("click", () => showScreen("home"));
  $("btn-retry").addEventListener("click", showMission);
}

function showScreen(name) {
  ["home", "mission", "game", "result"].forEach((s) => ($(`screen-${s}`).hidden = s !== name));
  $("btn-home").hidden = name === "home";
  if (name === "home") {
    renderProfile();
    renderBestScore();
  }
}

const SKILL_LABELS = { "+": "las sumas", "-": "las restas", "×": "las multiplicaciones", "÷": "las divisiones", patrones: "los patrones" };

function showMission() {
  const mode = MODES.find((m) => m.id === state.mode);
  const level = levelFromXp(getProfile().xp);
  const skin = skinForLevel(level);
  $("mission-title").textContent = mode.name;

  const weak = getWeakSkill(state.mode);
  const label = weak && SKILL_LABELS[weak.key];
  $("mission-text").textContent = label
    ? `La vez pasada te costaron un poco ${label} — ¡vamos a practicarlas! ${mode.mission}`
    : mode.mission;

  renderMascot($("mascot-mission"), { mood: weak ? "thinking" : "idle", color: skin.color, color2: skin.color2, core: skin.core, size: 110 });
  showScreen("mission");
}

// ---------- Orquestación de partida ----------

let quizEngine = null;
let memoryEngine = null;

function startGame() {
  state.score = 0;
  state.streak = 0;
  $("hud-score").textContent = "0";
  $("hud-streak").textContent = "0";
  showScreen("game");

  const gameSkin = skinForLevel(levelFromXp(getProfile().xp));
  renderMascot($("mascot-game"), { mood: "idle", color: gameSkin.color, color2: gameSkin.color2, core: gameSkin.core, size: 40 });

  const band = BANDS[state.band];

  if (state.mode === "memory") {
    $("quiz-area").hidden = true;
    $("memory-area").hidden = false;
    $("mission-strip").style.display = "none";
    $("timer-bar-wrap").style.visibility = "hidden";

    if (!memoryEngine) {
      memoryEngine = createMemoryEngine(
        { gridEl: $("memory-grid") },
        { onScore: onScore, onFinish: (r) => finishRound(`${r.moves} movimientos en ${r.seconds}s`, r.totalPairs, r.totalPairs) }
      );
    }
    memoryEngine.start(band.memoryPairs, band.memoryCols);
  } else {
    $("quiz-area").hidden = false;
    $("memory-area").hidden = true;
    $("mission-strip").style.display = "flex";
    $("timer-bar-wrap").style.visibility = "visible";

    if (!quizEngine) {
      quizEngine = createQuizEngine(
        {
          subjectEl: $("question-subject"),
          textEl: $("question-text"),
          answersEl: $("answers"),
          missionStripEl: $("mission-strip"),
          timerBarEl: $("timer-bar"),
          hintEl: $("question-hint"),
        },
        {
          onScore: onScore,
          onAnswered: (isCorrect, skillKey) => recordSkill(state.mode, skillKey, isCorrect),
          onFinish: (r) => finishRound(`${r.correct} de ${r.total} correctas`, r.correct, r.total),
        }
      );
    }
    quizEngine.start(buildRound(state.mode, band), band.questionSeconds);
  }
}

function onScore(delta, streakSignal) {
  state.score += delta;
  if (streakSignal === -1) state.streak = 0;
  else if (delta > 0) state.streak++;
  $("hud-score").textContent = state.score;
  $("hud-streak").textContent = state.streak;

  const mascotEl = document.querySelector("#mascot-game .mascot");
  const reacting = delta > 0 ? "happy" : streakSignal === -1 ? "sad" : null;
  if (mascotEl && reacting) {
    mascotEl.classList.remove("idle", "happy", "sad");
    mascotEl.classList.add(reacting);
    setTimeout(() => {
      mascotEl.classList.remove(reacting);
      mascotEl.classList.add("idle");
    }, 600);
  }

  if (reacting) {
    const bubble = $("mascot-speech");
    bubble.textContent = randomPhrase(reacting === "happy" ? "correct" : "wrong");
    bubble.classList.add("show");
    clearTimeout(bubble._hideTimer);
    bubble._hideTimer = setTimeout(() => bubble.classList.remove("show"), 1100);
  }
}

function buildRound(mode, band) {
  if (mode === "trivia") return shuffle([...TRIVIA[band.id]]).slice(0, band.questions);
  if (mode === "math") {
    const weak = getWeakSkill("math");
    return Array.from({ length: band.questions }, () => genMathQuestion(band, weak?.key));
  }
  if (mode === "logic") return Array.from({ length: band.questions }, () => genLogicQuestion(band));
  return [];
}

function finishRound(detailText, correct, total) {
  const { isRecord, prev } = setBestIfRecord(state.mode, state.band, state.score);
  const xpGained = Math.round(state.score / 4);
  const { leveledUp, level } = recordAttempt({ mode: state.mode, difficulty: state.band, correct, total, xpGained });

  const ratio = total ? correct / total : 1;
  const baseMood = ratio >= 0.5 || state.mode === "memory" ? "happy" : "sad";
  const mood = leveledUp ? "surprised" : baseMood;

  $("result-title").textContent = ratio >= 0.8 ? randomPhrase("win") : ratio >= 0.5 ? randomPhrase("okay") : randomPhrase("lose");
  $("result-detail").textContent = `${detailText} · Puntaje: ${state.score}`;
  $("result-record").textContent = isRecord ? "🏆 ¡Nuevo récord!" : prev ? `Récord actual: ${prev}` : "";
  $("result-xp").textContent = leveledUp ? `+${xpGained} XP · ¡Subiste a nivel ${level}! 🎉` : `+${xpGained} XP`;

  const skin = skinForLevel(level);
  renderMascot($("mascot-result"), { mood, color: skin.color, color2: skin.color2, core: skin.core, size: 120 });
  $("mascot-result").firstElementChild?.classList.add("mascot-lg");

  const chip = $("band-suggestion");
  const suggestion = state.mode !== "memory" ? suggestBandChange(state.band, ratio) : null;
  if (suggestion) {
    const bandName = BANDS[suggestion.band].name;
    chip.textContent = suggestion.direction === "up" ? `¿Probamos ${bandName}? ⚡` : `¿Bajamos a ${bandName} para practicar? 🙂`;
    chip.hidden = false;
    chip.onclick = () => {
      state.band = suggestion.band;
      renderBandGrid();
      chip.hidden = true;
      showMission();
    };
  } else {
    chip.hidden = true;
  }

  showScreen("result");
}

// ---------- Init ----------

wireHome();
showScreen("home");

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  });
}
