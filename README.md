# Chispamental

Plataforma de juegos educativos infantiles (6–11 años, 1°–5° de primaria). Cuatro modos — Matemática Rápida, Memoria, Lógica y Trivia Escolar —, tres bandas de dificultad/edad, progresión con XP/niveles y mascota (Chispi).

## Jugar

Abre `index.html` en un navegador, o publícalo con GitHub Pages (Settings → Pages → Deploy from branch → `main` → `/root`). No requiere build ni dependencias.

En vivo: https://chispamental.vercel.app (Vercel, auto-deploy en cada push a `main`).

## Arquitectura

```
index.html
assets/
  css/
    tokens.css       — paleta, tipografía, radios, accesibilidad (prefers-reduced-motion)
    mascot.css        — animaciones de Chispi
    components.css     — pantallas, tarjetas, HUD, quiz, memoria, resultado
  js/
    app.js             — orquestación: pantallas, selección de modo/banda, wiring
    mascot.js           — SVG de Chispi + skins desbloqueables por nivel
    progression.js       — XP, niveles, mejores puntajes (localStorage, sin datos personales)
    engine/
      quiz.js            — motor genérico de preguntas (math, lógica, trivia)
      memory.js           — motor del juego de memoria
      timer.js            — barra de tiempo reutilizable
    content/
      questions.js        — banco de trivia escolar por dificultad
      generators.js        — generadores procedurales de matemática y lógica
```

Separación deliberada: `content/` (qué se enseña) es independiente de `engine/` (cómo se juega) y de `progression.js` (cómo se recompensa) — para poder ampliar currículo o mecánicas sin tocar las otras capas.

## Bandas de dificultad

| Banda | Grado | Edad |
|---|---|---|
| Explorador | 1°–2° | 6–7 años |
| Aventurero | 3° | 8–9 años |
| Experto | 4°–5° | 10–11 años |

## Progresión

XP acumulada (independiente por partida) determina el nivel del jugador y desbloquea variantes de color de Chispi. Todo se guarda localmente en el navegador; no se recolecta información personal (ver `assets/js/progression.js`).
