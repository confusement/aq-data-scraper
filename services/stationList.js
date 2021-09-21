const puppeteer = require('puppeteer');
const log4js = require('log4js');
const logger = log4js.getLogger("stationList-script");
const util = require('util');
const fs = require('fs').promises;
const copyFile = util.promisify(require('fs').copyFile);
const unlink = util.promisify(require('fs').unlink)
const readFile = util.promisify(require('fs').readFile)

const baseURL = "https://app.cpcbccr.com/ccr/#/caaqm-dashboard-all/caaqm-landing/data";
const SaveFile = "station.jsl"

var browserInstance = null;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

async function reloadBrowser(){
    if(!browserInstance)
        browserInstance = await puppeteer.launch({
            headless: false ,
            executablePath: __dirname+'/../lib/chrome-linux/chrome',
            // executablePath: __dirname+'/../lib/chrome-win/chrome.exe',
            // args: ['--start-maximized']
        });
}
async function runScript(){
    await reloadBrowser();
    numStations = 0;
    let iter = 41;
    while(true){
        try{
            let page = await browserInstance.newPage();
            await page.goto(baseURL,{ waitUntil: 'domcontentloaded' , timeout:60000});
            await  page.waitForSelector('.placeholder',{timeout:60000})
            logger.debug("Clicking placeholder")
            await page.click('.placeholder');
            await page.click('body > app-root > app-caaqm-dashboard > div.container-fluid > div > main > section > app-caaqm-view-data > div > div > div:nth-child(1) > div:nth-child(1) > div > ng-select > select-dropdown > div > div.options > ul > li:nth-child(6)');
            await page.click('.placeholder');
            await page.click('body > app-root > app-caaqm-dashboard > div.container-fluid > div > main > section > app-caaqm-view-data > div > div > div:nth-child(1) > div:nth-child(2) > div > ng-select > select-dropdown > div > div.options > ul > li');
            await page.click('.placeholder');
            // await sleep(500);
            await page.click('body > app-root > app-caaqm-dashboard > div.container-fluid > div > main > section > app-caaqm-view-data > div > div > div:nth-child(2) > div:nth-child(1) > div > ng-select > select-dropdown > div > div.options > ul > li:nth-child('+iter+')');
            // await sleep(500);
            await page.click('.c-btn')
            // await sleep(500);
            await page.evaluate(() => document.querySelector('.pure-checkbox.select-all').click())
            // await sleep(500);
            
            logger.debug("Selection Complete")

            const [submit] = await page.$x("//button[contains(., 'Submit')]");
            await submit.click()
            await  page.waitForSelector('.toast.toast-success',{timeout:60000})

            newURL = await page.url();
            await fs.writeFile(__dirname+"/temp",newURL.toString())
            let decodedURL = await (await readFile(__dirname+"/temp")).toString();

            console.log(typeof decodedURL)
            decodedURL.replace(/\\/g,"")

            let stationNameElement = await page.$(".commonheading");
            let stationName = await page.evaluate(el => el.innerText, stationNameElement);
            
            stationName = stationName.split(" ").slice(0,-2).join(" ")
            let siteName = decodedURL.match(/site_..../g);
            
            if(siteName[3]=="%")
                siteName = siteName.slice(0, -1)

            console.log(siteName)
            console.log(stationName)
            console.log(stationName.split(",")[0])

            let urlSite = "https://app.cpcbccr.com/ccr/#/caaqm-dashboard-all/caaqm-landing/data/%7B%22state%22:%22Delhi%22,%22city%22:%22Delhi%22,%22station%22:%22"+siteName+"%22%7D"
            
            let template =    {
                "url": urlSite,
                "State": "Delhi",
                "City": "Delhi",
                "StationName": stationName,
                "StationCode": siteName,
                "IRI": stationName.split(",")[0]
            }
            logger.debug(template);

            await fs.appendFile(__dirname+"/"+SaveFile,JSON.stringify(template)+"\n")
            numStations++;
            page.close();
            // await sleep(2000);
        }
        catch (err){
            logger.error(err);
            break;
        }
        iter++;
    }
    return {
        "numStations":numStations
    }
}
module.exports = {
    'runScript': runScript,
}