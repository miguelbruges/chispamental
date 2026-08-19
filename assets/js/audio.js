// Audio sintetizado con Web Audio API — sin archivos externos (cero riesgo de licencias,
// cero peso de descarga). Firma sonora breve y no invasiva: momentos de silencio entre eventos.
const MUTE_KEY = "chispamental:muted";
let ctx = null;

function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

export function isMuted() {
  return localStorage.getItem(MUTE_KEY) === "1";
}

export function setMuted(muted) {
  localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
}

function tone(freq, start, duration, type = "sine", peak = 0.14) {
  const c = getCtx();
  if (!c || isMuted()) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t0 = c.currentTime + start;
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(peak, t0 + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

export function playSelect() {
  tone(720, 0, 0.08, "sine", 0.08);
}

export function playCorrect() {
  tone(660, 0, 0.12, "sine");
  tone(880, 0.08, 0.16, "sine");
}

export function playWrong() {
  tone(200, 0, 0.18, "sawtooth", 0.09);
}

export function playUnlock() {
  tone(523, 0, 0.12, "triangle");
  tone(659, 0.1, 0.12, "triangle");
  tone(784, 0.2, 0.22, "triangle");
}

export function playMissionComplete() {
  tone(523, 0, 0.14, "sine");
  tone(659, 0.12, 0.14, "sine");
  tone(784, 0.24, 0.14, "sine");
  tone(1046, 0.36, 0.3, "sine");
}
