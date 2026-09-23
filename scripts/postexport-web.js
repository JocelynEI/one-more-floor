/**
 * Finishes the static web export for GitHub Pages:
 * - 404.html: Pages serves it for unknown paths, so deep links (e.g. /settings) boot the app,
 *   and the router then shows the right screen.
 * - .nojekyll: stops Pages from ignoring the `_expo` folder (Jekyll skips underscore paths).
 */
const fs = require('node:fs');
const path = require('node:path');

const dist = path.join(__dirname, '..', 'dist');
fs.copyFileSync(path.join(dist, 'index.html'), path.join(dist, '404.html'));
fs.writeFileSync(path.join(dist, '.nojekyll'), '');
console.log('Web export ready for GitHub Pages in dist/');
