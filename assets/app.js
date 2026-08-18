import { TRIVIA } from "./questions.js";

const MODES = [
  { id: "math", icon: "➗", name: "Matemática Rápida", desc: "Resuelve operaciones contra el reloj." },
  { id: "logic", icon: "🧩", name: "Lógica", desc: "Descubre el patrón de la secuencia." },
  { id: "trivia", icon: "📚", name: "Trivia Escolar", desc: "Lenguaje, ciencias, geografía e historia." },
  { id: "memory", icon: "🧠", name: "Memoria", desc: "Encuentra todas las parejas." },
];

const DIFFICULTY = {
  facil: { label: "Fácil", questionSeconds: 20, questions: 10, mathRange: 10, mathOps: ["+", "-"], memoryPairs: 6, memoryCols: 4, logicMax: 3 },
  medio: { label: "Medio", questionSeconds: 15, questions: 10, mathRange: 20, mathOps: ["+", "-", "×"], memoryPairs: 8, memoryCols: 4, logicMax: 6 },
  dificil: { label: "Difícil", questionSeconds: 10, questions: 10, mathRange: 50, mathOps: ["+", "-", "×", "÷"], memoryPairs: 10, memoryCols: 5, logicMax: 10 },
};

const MEMORY_ICONS = ["🍎", "🚀", "⭐", "🐬", "🎈", "🌵", "🎵", "🔥", "🍀", "🐢", "🎲", "🌙"];

const $ = (id) => document.getElementById(id);

const state = {
  mode: "math",
  difficulty: "facil",
  score: 0,
  streak: 0,
  qIndex: 0,
  correctCount: 0,
  timerHandle: null,
  timeLeft: 0,
  round: [],
  memory: null,
};

// ---------- Home screen ----------

function renderModeGrid() {
  const grid = $("mode-grid");
  grid.innerHTML = "";
  MODES.forEach((m) => {
    const btn = document.createElement("button");
    btn.className = "mode-card" + (m.id === state.mode ? " active" : "");
    btn.innerHTML = `<span class="icon">${m.icon}</span><span class="name">${m.name}</span><span class="desc">${m.desc}</span>`;
    btn.addEventListener("click", () => {
      state.mode = m.id;
      renderModeGrid();
      renderBestScore();
    });
    grid.appendChild(btn);
  });
}

function renderBestScore() {
  const key = bestKey();
  const val = localStorage.getItem(key);
  $("best-score").textContent = val ? `Mejor puntaje: ${val}` : "Aún sin récord en este modo/nivel";
}

function bestKey() {
  return `chispamental:${state.mode}:${state.difficulty}`;
}

function wireHome() {
  renderModeGrid();
  renderBestScore();

  $("difficulty-seg").addEventListener("click", (e) => {
    const btn = e.target.closest(".seg-btn");
    if (!btn) return;
    state.difficulty = btn.dataset.diff;
    document.querySelectorAll("#difficulty-seg .seg-btn").forEach((b) => b.classList.toggle("active", b === btn));
    renderBestScore();
  });

  $("btn-play").addEventListener("click", startGame);
  $("btn-home").addEventListener("click", () => showScreen("home"));
  $("btn-menu").addEventListener("click", () => showScreen("home"));
  $("btn-retry").addEventListener("click", startGame);
}

// ---------- Screen management ----------

function showScreen(name) {
  ["home", "game", "result"].forEach((s) => {
    $(`screen-${s}`).hidden = s !== name;
  });
  $("btn-home").hidden = name === "home";
  if (name === "home") {
    stopTimer();
    renderModeGrid();
    renderBestScore();
  }
}

// ---------- Game orchestration ----------

function startGame() {
  state.score = 0;
  state.streak = 0;
  state.qIndex = 0;
  state.correctCount = 0;
  $("hud-score").textContent = "0";
  $("hud-streak").textContent = "0";
  showScreen("game");

  if (state.mode === "memory") {
    $("quiz-area").hidden = true;
    $("memory-area").hidden = false;
    $("hud-progress-wrap").hidden = true;
    $("timer-bar-wrap").style.visibility = "hidden";
    startMemory();
  } else {
    $("quiz-area").hidden = false;
    $("memory-area").hidden = true;
    $("hud-progress-wrap").hidden = false;
    $("timer-bar-wrap").style.visibility = "visible";
    state.round = buildRound(state.mode, state.difficulty);
    runQuizQuestion();
  }
}

function buildRound(mode, diffId) {
  const diff = DIFFICULTY[diffId];
  if (mode === "trivia") {
    return shuffle([...TRIVIA[diffId]]).slice(0, diff.questions);
  }
  if (mode === "math") {
    return Array.from({ length: diff.questions }, () => genMathQuestion(diff));
  }
  if (mode === "logic") {
    return Array.from({ length: diff.questions }, () => genLogicQuestion(diff));
  }
  return [];
}

// ---------- Quiz (math / logic / trivia) ----------

function runQuizQuestion() {
  const diff = DIFFICULTY[state.difficulty];
  const q = state.round[state.qIndex];

  $("hud-progress").textContent = `${state.qIndex + 1}/${diff.questions}`;
  $("question-subject").textContent = q.subject || modeLabel(state.mode);
  $("question-text").textContent = q.q;

  const answers = $("answers");
  answers.innerHTML = "";
  q.options.forEach((opt, i) => {
    const b = document.createElement("button");
    b.className = "answer-btn";
    b.textContent = opt;
    b.addEventListener("click", () => onAnswer(i, q.correct, b));
    answers.appendChild(b);
  });

  startTimer(diff.questionSeconds, () => onAnswer(-1, q.correct, null));
}

function onAnswer(chosenIndex, correctIndex, btnEl) {
  stopTimer();
  const answers = $("answers");
  [...answers.children].forEach((b, i) => {
    b.disabled = true;
    if (i === correctIndex) b.classList.add("correct");
    else if (i === chosenIndex) b.classList.add("wrong");
  });

  if (chosenIndex === correctIndex) {
    state.correctCount++;
    state.streak++;
    const speedBonus = Math.max(0, Math.round((state.timeLeft / DIFFICULTY[state.difficulty].questionSeconds) * 5));
    const streakBonus = state.streak >= 5 ? 2 : state.streak >= 3 ? 1 : 0;
    state.score += 10 + speedBonus + streakBonus * 5;
    if (btnEl) btnEl.classList.add("spark-pop");
  } else {
    state.streak = 0;
  }

  $("hud-score").textContent = state.score;
  $("hud-streak").textContent = state.streak;

  setTimeout(() => {
    state.qIndex++;
    if (state.qIndex >= state.round.length) {
      endGame();
    } else {
      runQuizQuestion();
    }
  }, 700);
}

function modeLabel(id) {
  return MODES.find((m) => m.id === id)?.name || "";
}

// ---------- Generators ----------

function genMathQuestion(diff) {
  const op = diff.mathOps[Math.floor(Math.random() * diff.mathOps.length)];
  let a, b, answer;
  if (op === "+") {
    a = rand(1, diff.mathRange); b = rand(1, diff.mathRange); answer = a + b;
  } else if (op === "-") {
    a = rand(1, diff.mathRange); b = rand(1, diff.mathRange);
    if (b > a) [a, b] = [b, a];
    answer = a - b;
  } else if (op === "×") {
    a = rand(2, Math.min(12, diff.mathRange)); b = rand(2, 12); answer = a * b;
  } else {
    b = rand(2, 12); answer = rand(2, 12); a = b * answer;
  }
  const options = shuffle([answer, ...distractors(answer)]);
  return {
    subject: "Matemática",
    q: `${a} ${op} ${b} = ?`,
    options: options.map(String),
    correct: options.indexOf(answer),
  };
}

function distractors(answer) {
  const set = new Set();
  while (set.size < 3) {
    const delta = rand(1, Math.max(3, Math.round(Math.abs(answer) * 0.2) + 2));
    const cand = Math.random() < 0.5 ? answer + delta : answer - delta;
    if (cand !== answer) set.add(cand);
  }
  return [...set];
}

function genLogicQuestion(diff) {
  const kind = Math.floor(Math.random() * 3);
  const step = rand(2, Math.max(2, diff.logicMax));
  const start = rand(1, diff.logicMax * 2);
  let seq, answer, desc;

  if (kind === 0) {
    seq = [start, start + step, start + step * 2, start + step * 3];
    answer = start + step * 4;
    desc = "¿Qué número sigue?";
  } else if (kind === 1) {
    seq = [start, start - step, start - step * 2, start - step * 3];
    answer = start - step * 4;
    desc = "¿Qué número sigue?";
  } else {
    const ratio = Math.min(3, Math.max(2, Math.floor(diff.logicMax / 3) + 1));
    const base = rand(1, 4);
    seq = [base, base * ratio, base * ratio * ratio];
    answer = base * ratio * ratio * ratio;
    desc = "¿Qué número continúa el patrón?";
  }

  const options = shuffle([answer, ...distractors(answer)]);
  return {
    subject: "Lógica",
    q: `${desc}  ${seq.join(", ")}, __`,
    options: options.map(String),
    correct: options.indexOf(answer),
  };
}

// ---------- Memory ----------

function startMemory() {
  const diff = DIFFICULTY[state.difficulty];
  const icons = shuffle([...MEMORY_ICONS]).slice(0, diff.memoryPairs);
  const cards = shuffle([...icons, ...icons]).map((icon, i) => ({ id: i, icon, flipped: false, matched: false }));

  state.memory = { cards, moves: 0, matchedPairs: 0, totalPairs: diff.memoryPairs, first: null, lock: false, startTime: Date.now() };

  const grid = $("memory-grid");
  grid.style.gridTemplateColumns = `repeat(${diff.memoryCols}, 1fr)`;
  grid.innerHTML = "";

  cards.forEach((card) => {
    const el = document.createElement("div");
    el.className = "memory-card";
    el.innerHTML = `
      <div class="memory-card-inner">
        <div class="memory-face memory-back"></div>
        <div class="memory-face memory-front">${card.icon}</div>
      </div>`;
    el.addEventListener("click", () => onMemoryFlip(card, el));
    grid.appendChild(el);
    card.el = el;
  });

  $("hud-score").textContent = "0";
  $("hud-streak").textContent = "0";
}

function onMemoryFlip(card, el) {
  const m = state.memory;
  if (m.lock || card.flipped || card.matched) return;

  card.flipped = true;
  el.classList.add("flipped");

  if (!m.first) {
    m.first = { card, el };
    return;
  }

  m.moves++;
  const second = { card, el };

  if (m.first.card.icon === second.card.icon) {
    m.first.card.matched = true;
    second.card.matched = true;
    m.first.el.classList.add("matched");
    second.el.classList.add("matched");
    m.matchedPairs++;
    state.score += 20;
    state.streak++;
    $("hud-score").textContent = state.score;
    $("hud-streak").textContent = state.streak;
    m.first = null;

    if (m.matchedPairs >= m.totalPairs) {
      setTimeout(endMemoryGame, 400);
    }
  } else {
    m.lock = true;
    state.streak = 0;
    $("hud-streak").textContent = "0";
    setTimeout(() => {
      m.first.card.flipped = false;
      second.card.flipped = false;
      m.first.el.classList.remove("flipped");
      second.el.classList.remove("flipped");
      m.first = null;
      m.lock = false;
    }, 700);
  }
}

function endMemoryGame() {
  const m = state.memory;
  const seconds = Math.round((Date.now() - m.startTime) / 1000);
  const timeBonus = Math.max(0, 200 - seconds * 3 - m.moves * 2);
  state.score += timeBonus;
  finishRound(`${m.moves} movimientos en ${seconds}s`, m.totalPairs, m.totalPairs);
}

// ---------- Timer ----------

function startTimer(seconds, onExpire) {
  stopTimer();
  state.timeLeft = seconds;
  const bar = $("timer-bar");
  bar.style.width = "100%";
  bar.classList.remove("low");
  const total = seconds * 10;
  let ticks = total;

  state.timerHandle = setInterval(() => {
    ticks--;
    state.timeLeft = ticks / 10;
    const pct = (ticks / total) * 100;
    bar.style.width = `${Math.max(0, pct)}%`;
    if (pct < 25) bar.classList.add("low");
    if (ticks <= 0) {
      stopTimer();
      onExpire();
    }
  }, 100);
}

function stopTimer() {
  if (state.timerHandle) {
    clearInterval(state.timerHandle);
    state.timerHandle = null;
  }
}

// ---------- End of round ----------

function endGame() {
  const diff = DIFFICULTY[state.difficulty];
  finishRound(`${state.correctCount} de ${diff.questions} correctas`, state.correctCount, diff.questions);
}

function finishRound(detailText, correct, total) {
  stopTimer();
  const key = bestKey();
  const prevBest = Number(localStorage.getItem(key) || 0);
  const isRecord = state.score > prevBest;
  if (isRecord) localStorage.setItem(key, String(state.score));

  const ratio = total ? correct / total : 0;
  $("result-title").textContent = ratio >= 0.8 ? "¡Excelente chispa! ⚡" : ratio >= 0.5 ? "¡Buen intento!" : "Sigue practicando";
  $("result-detail").textContent = `${detailText} · Puntaje: ${state.score}`;
  $("result-record").textContent = isRecord ? "🏆 ¡Nuevo récord!" : prevBest ? `Récord actual: ${prevBest}` : "";

  showScreen("result");
}

// ---------- Helpers ----------

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- Init ----------

wireHome();
showScreen("home");
