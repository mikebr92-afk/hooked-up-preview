import { createRequire } from 'node:module';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('playwright');
const b = await chromium.launch(); const out = [];
async function run(name, { url, width = 1280, fail = false, viaNav = null, phone = true }) {
  const pg = await b.newPage({ viewport: { width, height: width > 500 ? 900 : 844 } });
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  let payload = null;
  await pg.route(/emailjs/, async (r) => { payload = JSON.parse(r.request().postData() || '{}'); await r.fulfill(fail ? { status: 500, body: 'quota exceeded' } : { status: 200, body: 'OK' }); });
  await pg.route(/^https?:\/\/(?!localhost)(?!.*emailjs)/, r => r.abort());
  await pg.goto('http://localhost:8788' + (viaNav || url), { waitUntil: 'networkidle' });
  if (viaNav) { await pg.click(`a[href="${url}"]`); await pg.waitForSelector('.booking-card, .mobile-book-bar, [class*="sticky"]', { timeout: 10000 }).catch(() => {}); await pg.waitForTimeout(800); }
  // open the enquiry modal: desktop sidebar button, or mobile sticky bar
  const btn = width > 500 ? pg.locator('.booking-card button:has-text("Enquire")').first() : pg.locator('button:has-text("Enquire Now")').last();
  await btn.click(); await pg.waitForSelector('.modal-form', { timeout: 5000 });
  const opts = await pg.$$eval('.modal-form select', (ss) => ss.map((s) => [...s.options].map((o) => o.value)));
  for (const [i, o] of opts.entries()) { const v = o.find((x) => x); if (v) await pg.locator('.modal-form select').nth(i).selectOption(v); }
  await pg.fill('.modal-form input[type=text]', 'Test Angler');
  await pg.fill('.modal-form input[type=email]', 'test@example.com');
  if (phone) await pg.fill('.modal-form input[type=tel]', '0400 111 222');
  for (const d of await pg.$$('.modal-form input[type=date]')) await d.fill('2026-12-12');
  await pg.fill('.modal-form textarea', 'Test enquiry — please ignore.');
  await pg.click('.modal-form button[type=submit]');
  await pg.waitForTimeout(1500);
  const t0 = (await pg.innerText('.modal')).replace(/\s+/g, ' '); const text = t0.includes('Sorry') ? t0.slice(t0.indexOf('Sorry'), t0.indexOf('Sorry') + 160) : t0.slice(0, 160);
  out.push({ name, sent: !!payload, params: payload?.template_params, modal: text, errors: errs });
  await pg.close();
}

await run('desktop success', { url: '/charters/hooked-on-1770-agnes-water' });
await run('desktop email failure', { url: '/charters/hooked-on-1770-agnes-water', fail: true });
await run('mobile', { url: '/charters/fishabout-tours-sydney', width: 390 });


for (const o of out) console.log(JSON.stringify(o, null, 1));
await b.close();
