const log4js = require('log4js');
const logger = log4js.getLogger("cpcb-scraper");
const util = require('util');
const fs = require('fs').promises;
const path = require('path');

var browserInstance = {}

const config = require(__dirname+'/config/cpcb.json')

function setBrowserInstance(browser){
    browserInstance=browser;
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
async function scrape(args){
    try{
        for(i in config.locations){
            await getLocation(config.locations[i]);
        }
    }
    catch(err){
        logger.error(err);
    }
    await mapCSV();
    return {msg:"All location scraped"};
}
async function mapCSV(){
    files = await fs.readdir(__dirname+"/Data/RawData/cpcb");
    logger.debug(files);
}
async function getLocation(location){
    // logger.debug(locName);
    try {
        // console.log(browserInstance)
        const page = await browserInstance.newPage();
        await page.goto(location.url,{ waitUntil: 'domcontentloaded' });
        await  page.waitForSelector('multi-select',{timeout:60000})


        //Change to Hourly Model
        await page.click('ng-select[ng-reflect-model="24 Hours"]');
        await sleep(500);
        const [dropdown] = await page.$x("//li[contains(., '1 Hour')]");
        await dropdown.click();
        await sleep(500);
        //Select all Parameters
        await page.click('.c-btn')
        await sleep(500);
        await page.evaluate(() => document.querySelector('.pure-checkbox.select-all > input').click())
        await sleep(500);
        await page.click('.c-btn')
        await sleep(2000);

        //Click Submit
        const [submit] = await page.$x("//button[contains(., 'Submit')]");
        await submit.click()

        await  page.waitForSelector('.toast.toast-success',{timeout:60000})

        await page._client.send('Page.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath: __dirname+"/Data/RawData/cpcb",
        });

        await page.select('select[name="DataTables_Table_0_length"]', '100');
        await  page.waitForSelector('thead',{timeout:60000})

        let element = await page.$('#DataTables_Table_0')
        let value = await page.evaluate(el => el.innerText, element);

        let = tableString = value.replaceAll("\t",",");
        filename = location.RdfStation + Date.now()
        
        await fs.writeFile(__dirname+"/Data/RawData/cpcb/"+filename+".csv",tableString)
        
        //Download Excel File Deprecated
        // await page.click('a[data-tooltip="Excel"]');
        
        // function waitForDownload() {
        //     return new Promise(resolve => {
        //         page.once('response', response => resolve(response));
        //     });
        //   }
        // response = await waitForDownload();
        // const url = response.request().url();
        // const contentType = response.headers()['content-type'];
        
        await sleep(100);
        page.close();
    }
    catch(err){
        logger.error(err);
    }
}
module.exports = {
    'scrape': scrape,
    'setBrowserInstance':setBrowserInstance
}