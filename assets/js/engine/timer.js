// Barra de tiempo reutilizable (cuenta regresiva a 10 ticks/seg para animación suave).
export function createTimer(barEl) {
  let handle = null;
  let timeLeft = 0;

  function start(seconds, onExpire) {
    stop();
    timeLeft = seconds;
    barEl.style.width = "100%";
    barEl.classList.remove("low");
    const total = seconds * 10;
    let ticks = total;

    handle = setInterval(() => {
      ticks--;
      timeLeft = ticks / 10;
      const pct = (ticks / total) * 100;
      barEl.style.width = `${Math.max(0, pct)}%`;
      if (pct < 25) barEl.classList.add("low");
      if (ticks <= 0) {
        stop();
        onExpire();
      }
    }, 100);
  }

  function stop() {
    if (handle) {
      clearInterval(handle);
      handle = null;
    }
  }

  return { start, stop, get timeLeft() { return timeLeft; } };
}
