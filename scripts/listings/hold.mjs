// Remove listings from the live data (held for a phone check). Usage: node hold.mjs <repo> <slug...>
import fs from 'node:fs';
import { parseLiteralAt } from './jslit.mjs';
const [REPO, ...slugs] = process.argv.slice(2);
const opsPath = `${REPO}/data/operators.json`;
const ops = JSON.parse(fs.readFileSync(opsPath, 'utf8'));
let html = fs.readFileSync(`${REPO}/index.html`, 'utf8');
const at = html.indexOf('Rr=[') + 3;
const [cards, end] = parseLiteralAt(html, at);
const lit = (v) => v === null || v === undefined ? 'null' : typeof v === 'boolean' ? (v ? '!0' : '!1') : typeof v === 'number' ? String(v)
  : typeof v === 'string' ? JSON.stringify(v) : Array.isArray(v) ? '[' + v.map(lit).join(',') + ']'
  : '{' + Object.entries(v).map(([k, x]) => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)) + ':' + lit(x)).join(',') + '}';
const keepOps = ops.filter((o) => !slugs.includes(o.slug)), keepCards = cards.filter((c) => !slugs.includes(c.slug));
fs.writeFileSync(opsPath, JSON.stringify(keepOps));
fs.writeFileSync(`${REPO}/index.html`, html.slice(0, at) + lit(keepCards) + html.slice(end));
for (const s of slugs) if (fs.existsSync(`${REPO}/images/operators/${s}`)) fs.rmSync(`${REPO}/images/operators/${s}`, { recursive: true });
console.log(`held ${ops.length - keepOps.length} ops, ${cards.length - keepCards.length} cards; ${keepOps.length} remain`);
