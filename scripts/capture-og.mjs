import { chromium } from 'playwright';

const URL = process.env.OG_URL || 'https://www.pulsepro.work';
const OUT = process.env.OG_OUT || 'public/og.png';

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 2,
});
await page.goto(URL, { waitUntil: 'networkidle' });
// zoom out so the hero headline AND the dashboard mock both fit the 1.91:1 frame
const zoom = process.env.OG_ZOOM || '0.62';
await page.evaluate((z) => { document.body.style.zoom = z; }, zoom);
// let fonts/animations settle
await page.waitForTimeout(1500);
await page.screenshot({ path: OUT, clip: { x: 0, y: 0, width: 1200, height: 630 } });
await browser.close();
console.log(`Saved ${OUT} from ${URL}`);
