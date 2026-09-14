// Post-build static prerender.
//
// This site is a client-rendered React SPA (no SSR) deployed as static files
// on GitHub Pages. Many non-Google crawlers — and most fetch-based "agentic"
// tools — don't execute JavaScript, so they'd otherwise see an empty
// <div id="root">. This script serves the built dist/public/ folder, loads it
// in a real headless browser, waits for the app to fully render (including
// below-the-fold IntersectionObserver-triggered content), and writes the
// resulting DOM back into dist/public/index.html. The <script type="module">
// tag is preserved, so once a real visitor's browser loads the page, React
// mounts on top and the site is fully interactive as before — crawlers just
// also get real content without running JS.
//
// Runs automatically after `npm run build` via the `postbuild` script.

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer';

const DIST_DIR = path.resolve(import.meta.dirname, '..', 'dist', 'public');
const INDEX_HTML = path.join(DIST_DIR, 'index.html');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
  '.mp4': 'video/mp4',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
};

function startStaticServer(rootDir) {
  const server = createServer(async (req, res) => {
    try {
      const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      let filePath = path.join(rootDir, urlPath === '/' ? 'index.html' : urlPath);
      if (!existsSync(filePath)) filePath = path.join(rootDir, 'index.html'); // SPA fallback
      const ext = path.extname(filePath);
      const body = await readFile(filePath);
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      res.end(body);
    } catch (err) {
      res.writeHead(404);
      res.end('Not found');
    }
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

async function main() {
  if (!existsSync(INDEX_HTML)) {
    console.error('[prerender] dist/public/index.html not found — run `vite build` first. Skipping.');
    process.exit(0);
  }

  const server = await startStaticServer(DIST_DIR);
  const { port } = server.address();
  const url = `http://127.0.0.1:${port}/`;

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    // Block the visitor-counter API so every build doesn't inflate the real
    // count, and block third-party runtime APIs that aren't needed for a
    // content snapshot.
    await page.setRequestInterception(true);
    const BLOCKED_HOSTS = ['api.counterapi.dev', 'api.groq.com'];
    page.on('request', (req) => {
      try {
        const host = new URL(req.url()).hostname;
        if (BLOCKED_HOSTS.some((h) => host.includes(h))) return req.abort();
      } catch {}
      req.continue();
    });

    page.on('pageerror', (err) => console.warn('[prerender] page error:', err.message));

    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

    // Wait for the app to mount (root has content) and fonts to load.
    await page.waitForFunction(
      () => document.getElementById('root')?.childElementCount > 0,
      { timeout: 15000 }
    );
    await page.evaluate(() => document.fonts?.ready).catch(() => {});

    // Scroll through the full page so IntersectionObserver-driven reveal
    // animations (scroll-in sections, flip-card peek, counters) all fire.
    await page.evaluate(async () => {
      const step = 700;
      const height = document.body.scrollHeight;
      for (let y = 0; y < height; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 180));
      }
      window.scrollTo(0, 0);
    });

    // Settle time for CSS transitions / counter animations to finish.
    await new Promise((r) => setTimeout(r, 1500));

    const html = await page.content();
    await writeIndexHtml(html);
    console.log('[prerender] Wrote prerendered dist/public/index.html');
  } finally {
    if (browser) await browser.close();
    server.close();
  }
}

async function writeIndexHtml(html) {
  const { writeFile } = await import('node:fs/promises');
  await writeFile(INDEX_HTML, `<!doctype html>\n${html}\n`, 'utf-8');
}

main().catch((err) => {
  console.error('[prerender] Failed:', err);
  // Never fail the whole build over prerendering — fall back to the
  // client-rendered index.html that vite already produced.
  process.exit(0);
});
