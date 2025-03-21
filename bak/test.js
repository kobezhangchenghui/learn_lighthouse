const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  console.log('浏览器版本:', await browser.version());
  await browser.close();
})();