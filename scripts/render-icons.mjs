/**
 * Renders every app icon and splash image from assets/brand/lift-mark.svg.
 * Needs `sharp`, which is not a project dependency: run
 *   npm install --no-save sharp && node scripts/render-icons.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const mark = readFileSync(join(root, 'assets/brand/lift-mark.svg'), 'utf8').replace(/<!--.*?-->/s, '');

const background = `
  <defs>
    <radialGradient id="bg" cx="50%" cy="42%" r="70%">
      <stop offset="0" stop-color="#1B2942"/>
      <stop offset="1" stop-color="#0E1420"/>
    </radialGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#bg)"/>`;

function svg(body, scale = 1) {
  const offset = (1024 - 1024 * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
${body.background ?? ''}
<g transform="translate(${offset} ${offset}) scale(${scale})">${body.mark}</g>
</svg>`;
}

/** Android themed icon: a single-colour silhouette where only the alpha channel matters. */
const monochromeMark = `
  <rect x="402" y="150" width="220" height="104" rx="52" fill="none" stroke="#FFFFFF" stroke-width="14"/>
  <path d="M512 174 L566 232 H458 Z" fill="#FFFFFF"/>
  <rect x="252" y="292" width="520" height="580" rx="66" fill="none" stroke="#FFFFFF" stroke-width="22"/>
  <rect x="304" y="344" width="196" height="476" rx="22" fill="#FFFFFF"/>
  <rect x="524" y="344" width="196" height="476" rx="22" fill="#FFFFFF"/>`;

const outputs = [
  { file: 'assets/icon.png', size: 1024, content: svg({ background, mark }, 0.92), flatten: true },
  { file: 'assets/brand/icon-master-2048.png', size: 2048, content: svg({ background, mark }, 0.92), flatten: true },
  { file: 'assets/android-icon-foreground.png', size: 1024, content: svg({ mark }, 0.62) },
  { file: 'assets/android-icon-monochrome.png', size: 1024, content: svg({ mark: monochromeMark }, 0.62) },
  { file: 'assets/splash-icon.png', size: 512, content: svg({ mark }, 1) },
  { file: 'assets/favicon.png', size: 48, content: svg({ background, mark }, 1) },
];

for (const output of outputs) {
  let image = sharp(Buffer.from(output.content), { density: (72 * output.size) / 1024 }).resize(output.size, output.size);
  if (output.flatten) image = image.flatten({ background: '#0E1420' });
  writeFileSync(join(root, output.file), await image.png({ compressionLevel: 9 }).toBuffer());
  console.log('wrote', output.file);
}
