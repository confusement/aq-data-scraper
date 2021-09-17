const puppeteer = require("puppeteer");
var log4js = require("log4js");
const logger = log4js.getLogger("browser");
const util = require("util");
const fs = require("fs").promises;
const path = require("path");

var browserInstance = null;
async function getBrowserInstance(){
    return await browser.newPage();;
}
async function reloadBrowser() {
    if (!browserInstance)
      browserInstance = await puppeteer.launch({
        headless: false,
        //executablePath: __dirname + "/../lib/chrome-linux/chrome",
        executablePath: __dirname + "/../lib/chrome-win/chrome.exe",
        // args: ['--start-maximized']
      });
}
function getBrowserStatus(){

}
module.exports = {
    "reloadBrowser": reloadBrowser,
    "getBrowserStatus": getBrowserStatus,
};