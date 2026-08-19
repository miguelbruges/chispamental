// Efecto de partículas "chispa" — feedback semántico de acierto, no decorativo al azar.
export function spawnSparks(anchorEl, count = 8) {
  if (!anchorEl || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const rect = anchorEl.getBoundingClientRect();
  const wrap = document.createElement("div");
  wrap.className = "spark-particles";
  wrap.style.position = "fixed";
  wrap.style.left = `${rect.left}px`;
  wrap.style.top = `${rect.top}px`;
  wrap.style.width = `${rect.width}px`;
  wrap.style.height = `${rect.height}px`;
  document.body.appendChild(wrap);

  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    p.className = "spark-particle";
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const dist = 30 + Math.random() * 24;
    p.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
    p.style.setProperty("--dy", `${Math.sin(angle) * dist}px`);
    wrap.appendChild(p);
  }

  setTimeout(() => wrap.remove(), 700);
}
