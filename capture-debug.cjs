const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  const logs = [];
  page.on('console', msg => logs.push(`LOG: ${msg.text()}`));
  page.on('pageerror', error => logs.push(`ERROR: ${error.message}`));
  
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 10000 });
  } catch (e) {
    logs.push(`NAVIGATION FAILED: ${e.message}`);
  }
  
  await page.screenshot({ path: '/tmp/debug-screenshot.png' });
  console.log(JSON.stringify({ logs, screenshot: '/tmp/debug-screenshot.png' }, null, 2));
  
  await browser.close();
})();
