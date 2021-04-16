const log4js = require("log4js");
//const logger = log4js.getLogger("hysplit-scraper");
const util = require("util");
const http = require("http");
const https = require("https"); // or 'https' for https:// URLs
const fs = require("fs");
const path = require("path");
const exec = util.promisify(require("child_process").exec);
const puppeteer = require("puppeteer");
var url = require("url");

var browserInstance = null;
async function reloadBrowser() {
  if (!browserInstance)
    browserInstance = await puppeteer.launch({
      headless: true,
      // args: ['--start-maximized']
    });
}

const config = require(__dirname + "/config/hysplit.json");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function scrape(args) {
  // Create new browser if not already running
  await reloadBrowser();
  try {
    console.log(config.locations[0]);
    //await getKMZ(config.locations[0]);
    for (i in config.locations) {
      await getKMZ(config.locations[i]);
    }
  } catch (err) {
    logger.error(err);
  }
  return { msg: "All location scraped" };
}

async function getKMZ(location) {
  let page;
  try {
    page = await browserInstance.newPage();
    const hysplit_url =
      "https://www.ready.noaa.gov/hypub-bin/trajtype.pl?runtype=archive";
    await page.goto(hysplit_url, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await sleep(2000);
    await page.waitForSelector('Input[value="Next>>"]');
    await page.click('Input[value="Next>>"]');
    await page.waitForSelector('select[name="metdata"]');

    await page.select('select[name="metdata"]', "GFS0p25");
    const lat = location.latitude;
    const long = location.longitude;
    await page.$eval(
      "input[id=LonId]",
      (el, value) => (el.value = value),
      long
    );
    await page.$eval("input[id=LatId]", (el, value) => (el.value = value), lat);
    await page.select("#ewId", "E");
    await page.waitForSelector('Input[value="Next>>"]');
    await page.click('Input[value="Next>>"]');
    await sleep(1000);
    await page.waitForSelector('Input[value="Next>>"]');
    await page.click('Input[value="Next>>"]');
    await page.waitForSelector('Input[value="Backward"]');
    await page.click('Input[value="Backward"]');
    await page.$eval(
      "input[name='duration']",
      (el, value) => (el.value = value),
      "24"
    );

    await page.evaluate(() =>
      document
        .querySelector(
          "#page_center > table > tbody > tr > td > div.page_content > form > div:nth-child(5) > table:nth-child(3) > tbody > tr:nth-child(1) > td:nth-child(3) > input[type=RADIO]"
        )
        .click()
    );
    await page.waitForSelector(
      'Input[value="Request trajectory (only press once!)"]'
    );
    await page.click('Input[value="Request trajectory (only press once!)"]');

    await page.waitForSelector(
      "#page_center > table > tbody > tr > td > div.page_content > table:nth-child(4) > tbody > tr > td > font > table > tbody > tr:nth-child(3) > td:nth-child(4) > font > b > a",
      {
        timeout: 120000,
      }
    );
    await sleep(5000);
    console.log(page.url());

    const queryString = new URL(page.url());
    const params = queryString.searchParams;
    var jobno = "";
    for (const param of params) {
      if ("jobidno" === param[0]) {
        jobno = param[1];
      }
    }
    const filename = location.IRI;
    const file = fs.createWriteStream(
      __dirname + "/Data/RawData/hysplit/" + filename + ".kmz"
    );
    const request = https.get(
      "https://www.ready.noaa.gov/hypubout/HYSPLITtraj_" + jobno + ".kmz",
      function (response) {
        response.pipe(file);
      }
    );
  } catch (err) {
    page.close();
    console.log(err);
  }
}
