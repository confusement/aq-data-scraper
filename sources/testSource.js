// const log4js = require("log4js");
// const logger = log4js.getLogger("test-scraper");
// const puppeteer = require("puppeteer");
// var browserInstance = null;
// async function reloadBrowser() {
//   if (!browserInstance)
//     browserInstance = await puppeteer.launch({
//       headless: true,
//       executablePath: "/usr/bin/chromium",
//       // args: ['--start-maximized']
//     });
// }
// function sleep(ms) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }
// async function test(args) {
//   await reloadBrowser();
//   try {
//     for (i = 0; i < 1; i++) {
//       page = await browserInstance.newPage();
//       await page.goto("https://github.com/confusement/aq-data-scraper", {
//         waitUntil: "domcontentloaded",
//         timeout: 60000,
//       });
//     }
//   } catch (err) {
//     logger.error(err);
//   }
//   // await mapCSV();
//   return { msg: "All location scraped" };
// }
// module.exports = {
//   test: test,
// };

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function execute() {
  var aa = await uuidv4();
  console.log(aa);
}

execute();
