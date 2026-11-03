// Local emulation of the Cloudflare Workers + static assets setup in wrangler.jsonc.
// Usage: node serve.mjs <repoDir> <port>
import http from 'node:http';
import zlib from 'node:zlib';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(process.argv[2]);
const PORT = +(process.argv[3] || 8787);
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'wrangler.jsonc'), 'utf8').replace(/^\s*\/\/.*$/gm, ''));
const rwf = cfg.assets.run_worker_first;
const worker = (await import(pathToFileURL(path.join(ROOT, cfg.main)).href + '?t=' + Date.now())).default;

const TYPES = { '.html': 'text/html;charset=UTF-8', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif', '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon', '.xml': 'application/xml', '.txt': 'text/plain', '.js': 'text/javascript', '.json': 'application/json',
  '.css': 'text/css', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };

function globToRe(g) {
  return new RegExp('^' + g.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
}
function workerFirst(p) {
  if (rwf === true) return true;
  if (!Array.isArray(rwf)) return false;
  let hit = false;
  for (const r of rwf) {
    if (r.startsWith('!')) { if (globToRe(r.slice(1)).test(p)) return false; }
    else if (globToRe(r).test(p)) hit = true;
  }
  return hit;
}
function staticFile(p) {
  let f = path.join(ROOT, decodeURIComponent(p));
  if (!f.startsWith(ROOT)) return null;
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  return fs.existsSync(f) && fs.statSync(f).isFile() ? f : null;
}
// env.ASSETS.fetch: static file, else SPA fallback (index.html, 200) — like not_found_handling: single-page-application
const ASSETS = {
  async fetch(req) {
    const u = new URL(typeof req === 'string' ? req : req.url);
    const f = staticFile(u.pathname);
    if (f) return new Response(fs.readFileSync(f), { status: 200, headers: { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' } });
    return new Response(fs.readFileSync(path.join(ROOT, 'index.html')), { status: 200, headers: { 'content-type': TYPES['.html'] } });
  },
};

http.createServer(async (req, res) => {
  try {
    const url = `http://localhost:${PORT}${req.url}`;
    const p = new URL(url).pathname;
    const request = new Request(url, { method: req.method, headers: req.headers });
    let resp;
    if (workerFirst(p)) resp = await worker.fetch(request, { ASSETS });
    else if (staticFile(p)) resp = await ASSETS.fetch(request);
    else resp = await ASSETS.fetch(request); // SPA navigation fallback (worker not invoked)
    let buf = Buffer.from(await resp.arrayBuffer());
    const headers = Object.fromEntries(resp.headers.entries());
    // Cloudflare compresses text responses; mirror that so measurements are realistic.
    if (/gzip/.test(req.headers['accept-encoding'] || '') && /text|javascript|json|xml/.test(headers['content-type'] || '')) {
      buf = zlib.gzipSync(buf, { level: 6 }); headers['content-encoding'] = 'gzip'; delete headers['content-length'];
    }
    res.writeHead(resp.status, headers);
    res.end(req.method === 'HEAD' ? undefined : buf);
  } catch (e) {
    res.writeHead(500); res.end(String(e.stack || e));
  }
}).listen(PORT, () => console.log(`serving ${ROOT} on :${PORT} (run_worker_first=${JSON.stringify(rwf)})`));
