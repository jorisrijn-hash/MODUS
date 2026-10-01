// Generates a synthetic grid test texture for the Checkpoint 2 image
// bulge/distortion spike — deliberately NOT a stock photo, matching this
// project's existing discipline (FieldPhoto.tsx) of never using fake
// photography. A grid makes shader distortion visually legible in a way
// a photo wouldn't for a technical spike.
import { writeFileSync } from "node:fs";

const W = 1200;
const H = 800;
const CELL = 40;

let cells = "";
for (let x = 0; x <= W; x += CELL) {
  cells += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="#D9DCD7" stroke-width="1"/>`;
}
for (let y = 0; y <= H; y += CELL) {
  cells += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#D9DCD7" stroke-width="1"/>`;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#FAFAF8"/>
  ${cells}
  <circle cx="${W / 2}" cy="${H / 2}" r="140" fill="none" stroke="#123C2D" stroke-width="3"/>
  <text x="${W / 2}" y="${H / 2 + 6}" font-family="monospace" font-size="14" fill="#123C2D" text-anchor="middle">MOTION LAB / TEST GRID</text>
</svg>`;

writeFileSync(new URL("../public/motion-lab/test-grid.svg", import.meta.url), svg);
console.log("wrote public/motion-lab/test-grid.svg");
