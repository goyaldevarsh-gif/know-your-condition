// Renders dist/pdf-src/<lang>/<slug>/ to dist/pdf/<lang>/<slug>.pdf, then removes dist/pdf-src.
// Local: CHROME_PATH=/usr/bin/google-chrome npm run build   (skips with a warning if no browser)
// CI:    REQUIRE_PDF=1 so a missing PDF fails the build instead of shipping a dead button.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const BASE = '/know-your-condition';
const dist = path.resolve('dist');
const src = path.join(dist, 'pdf-src');
if (!fs.existsSync(src)) process.exit(0);
const required = process.env.REQUIRE_PDF === '1';

const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.startsWith(BASE)) p = p.slice(BASE.length);
  let f = path.join(dist, p);
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!f.startsWith(dist) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': mime[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const port = server.address().port;

const jobs = [];
for (const lang of fs.readdirSync(src)) {
  for (const slug of fs.readdirSync(path.join(src, lang))) jobs.push({ lang, slug });
}

let browser;
try {
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
} catch (e) {
  server.close();
  fs.rmSync(src, { recursive: true, force: true });
  const msg = `[pdf] Could not start a browser, PDFs were NOT generated: ${e.message.split('\n')[0]}`;
  if (required) { console.error(msg); process.exit(1); }
  console.warn(msg);
  process.exit(0);
}

for (const { lang, slug } of jobs) {
  const page = await browser.newPage();
  await page.goto(`http://localhost:${port}${BASE}/pdf-src/${lang}/${slug}/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const out = path.join(dist, 'pdf', lang, `${slug}.pdf`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await page.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true });
  await page.close();
  console.log(`[pdf] ${lang}/${slug}.pdf`);
}
await browser.close();
server.close();
fs.rmSync(src, { recursive: true, force: true });
