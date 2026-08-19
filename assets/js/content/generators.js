// Generadores procedurales de contenido para Matemática Rápida y Lógica.
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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

const MATH_HINTS = {
  "+": "Suma primero las unidades, luego las decenas.",
  "-": "Si el número de abajo es más grande, presta una decena.",
  "×": "Piensa en grupos iguales: ¿cuántos grupos y de cuánto?",
  "÷": "Piensa en repartir en partes iguales.",
};

// biasOp: operador en el que el jugador ha fallado más — se prioriza sin eliminar variedad.
export function genMathQuestion(diff, biasOp) {
  const useBias = biasOp && diff.mathOps.includes(biasOp) && Math.random() < 0.55;
  const op = useBias ? biasOp : diff.mathOps[Math.floor(Math.random() * diff.mathOps.length)];
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
    skillKey: op,
    hint: MATH_HINTS[op],
  };
}

export function genLogicQuestion(diff) {
  const kind = Math.floor(Math.random() * 3);
  const step = rand(2, Math.max(2, diff.logicMax));
  const start = rand(1, diff.logicMax * 2);
  let seq, answer, desc, hint;

  if (kind === 0) {
    seq = [start, start + step, start + step * 2, start + step * 3];
    answer = start + step * 4;
    desc = "¿Qué número sigue?";
    hint = `Fíjate: cada número sube ${step}.`;
  } else if (kind === 1) {
    seq = [start, start - step, start - step * 2, start - step * 3];
    answer = start - step * 4;
    desc = "¿Qué número sigue?";
    hint = `Fíjate: cada número baja ${step}.`;
  } else {
    const ratio = Math.min(3, Math.max(2, Math.floor(diff.logicMax / 3) + 1));
    const base = rand(1, 4);
    seq = [base, base * ratio, base * ratio * ratio];
    answer = base * ratio * ratio * ratio;
    desc = "¿Qué número continúa el patrón?";
    hint = `Fíjate: cada número se multiplica por ${ratio}.`;
  }

  const options = shuffle([answer, ...distractors(answer)]);
  return {
    subject: "Lógica",
    q: `${desc}  ${seq.join(", ")}, __`,
    skillKey: "patrones",
    hint,
    options: options.map(String),
    correct: options.indexOf(answer),
  };
}
