import { createTimer } from "./timer.js";
import { spawnSparks } from "../effects.js";

// Motor genérico de preguntas de opción múltiple. Lo usan Matemática Rápida, Lógica y Trivia Escolar.
// dom: { subjectEl, textEl, answersEl, progressEl, missionStripEl, timerBarEl }
export function createQuizEngine(dom, { onScore, onAnswered, onFinish }) {
  const timer = createTimer(dom.timerBarEl);
  let round = [];
  let index = 0;
  let questionSeconds = 10;
  let correctCount = 0;
  let streak = 0;

  function renderMissionStrip() {
    if (!dom.missionStripEl) return;
    dom.missionStripEl.innerHTML = round
      .map((_, i) => {
        const cls = i < index ? "done" : i === index ? "current" : "";
        return `<span class="mission-step ${cls}"></span>`;
      })
      .join("");
  }

  function start(newRound, seconds) {
    round = newRound;
    index = 0;
    correctCount = 0;
    streak = 0;
    questionSeconds = seconds;
    askCurrent();
  }

  function askCurrent() {
    const q = round[index];
    if (dom.progressEl) dom.progressEl.textContent = `${index + 1}/${round.length}`;
    dom.subjectEl.textContent = q.subject || "";
    dom.textEl.textContent = q.q;
    if (dom.hintEl) { dom.hintEl.textContent = ""; dom.hintEl.classList.remove("show"); }
    renderMissionStrip();

    dom.answersEl.innerHTML = "";
    q.options.forEach((opt, i) => {
      const b = document.createElement("button");
      b.className = "answer-btn";
      b.textContent = opt;
      b.addEventListener("click", () => answer(i));
      dom.answersEl.appendChild(b);
    });

    timer.start(questionSeconds, () => answer(-1));
  }

  function answer(chosenIndex) {
    timer.stop();
    const q = round[index];
    const buttons = [...dom.answersEl.children];
    buttons.forEach((b, i) => {
      b.disabled = true;
      if (i === q.correct) b.classList.add("correct");
      else if (i === chosenIndex) b.classList.add("wrong");
    });

    const isCorrect = chosenIndex === q.correct;
    let gained = 0;
    if (isCorrect) {
      correctCount++;
      streak++;
      const speedBonus = Math.max(0, Math.round((timer.timeLeft / questionSeconds) * 5));
      const streakBonus = streak >= 5 ? 2 : streak >= 3 ? 1 : 0;
      gained = 10 + speedBonus + streakBonus * 5;
      if (buttons[chosenIndex]) {
        buttons[chosenIndex].classList.add("spark-pop");
        spawnSparks(buttons[chosenIndex]);
      }
    } else {
      streak = 0;
    }

    onScore(gained, isCorrect ? streak : -1);
    onAnswered(isCorrect, q.skillKey);

    // Nivel 1 de retroalimentación de error: pista breve antes de avanzar (§ error y feedback).
    let pause = 700;
    if (!isCorrect && q.hint && dom.hintEl) {
      dom.hintEl.textContent = `💡 ${q.hint}`;
      dom.hintEl.classList.add("show");
      pause = 1900;
    }

    setTimeout(() => {
      index++;
      if (index >= round.length) {
        onFinish({ correct: correctCount, total: round.length });
      } else {
        askCurrent();
      }
    }, pause);
  }

  function stop() {
    timer.stop();
  }

  return { start, stop };
}
