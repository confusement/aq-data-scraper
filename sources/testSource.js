const log4js = require("log4js");
const logger = log4js.getLogger("test-scraper");
const puppeteer = require("puppeteer");
var browserInstance = null;
async function reloadBrowser() {
  if (!browserInstance)
    browserInstance = await puppeteer.launch({
      headless: true,
      executablePath: "/usr/bin/chromium",
      // args: ['--start-maximized']
    });
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function test(args) {
  await reloadBrowser();
  try {
    for (i = 0; i < 1; i++) {
      page = await browserInstance.newPage();
      await page.goto("https://github.com/confusement/aq-data-scraper", {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
    }
  } catch (err) {
    logger.error(err);
  }
  // await mapCSV();
  return { msg: "All location scraped" };
}
module.exports = {
  test: test,
};
