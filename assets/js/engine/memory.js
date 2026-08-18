import { shuffle } from "../content/generators.js";

const ICONS = ["🍎", "🚀", "⭐", "🐬", "🎈", "🌵", "🎵", "🔥", "🍀", "🐢", "🎲", "🌙"];

// dom: { gridEl }
export function createMemoryEngine(dom, { onScore, onFinish }) {
  let state = null;

  function start(pairs, cols) {
    const icons = shuffle([...ICONS]).slice(0, pairs);
    const cards = shuffle([...icons, ...icons]).map((icon, i) => ({ id: i, icon, flipped: false, matched: false }));
    state = { cards, moves: 0, matchedPairs: 0, totalPairs: pairs, first: null, lock: false, startTime: Date.now() };

    dom.gridEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    dom.gridEl.innerHTML = "";

    cards.forEach((card) => {
      const el = document.createElement("div");
      el.className = "memory-card";
      el.innerHTML = `
        <div class="memory-card-inner">
          <div class="memory-face memory-back"></div>
          <div class="memory-face memory-front">${card.icon}</div>
        </div>`;
      el.addEventListener("click", () => flip(card, el));
      dom.gridEl.appendChild(el);
      card.el = el;
    });
  }

  function flip(card, el) {
    if (state.lock || card.flipped || card.matched) return;
    card.flipped = true;
    el.classList.add("flipped");

    if (!state.first) {
      state.first = { card, el };
      return;
    }

    state.moves++;
    const second = { card, el };

    if (state.first.card.icon === second.card.icon) {
      state.first.card.matched = true;
      second.card.matched = true;
      state.first.el.classList.add("matched");
      second.el.classList.add("matched");
      state.matchedPairs++;
      onScore(20, 0);
      state.first = null;

      if (state.matchedPairs >= state.totalPairs) {
        setTimeout(() => {
          const seconds = Math.round((Date.now() - state.startTime) / 1000);
          const timeBonus = Math.max(0, 200 - seconds * 3 - state.moves * 2);
          onScore(timeBonus, 0);
          onFinish({ moves: state.moves, seconds, totalPairs: state.totalPairs });
        }, 400);
      }
    } else {
      state.lock = true;
      onScore(0, -1); // -1 señaliza romper racha
      setTimeout(() => {
        state.first.card.flipped = false;
        second.card.flipped = false;
        state.first.el.classList.remove("flipped");
        second.el.classList.remove("flipped");
        state.first = null;
        state.lock = false;
      }, 700);
    }
  }

  return { start };
}
