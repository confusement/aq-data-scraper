const log4js = require('log4js');
const logger = log4js.getLogger("cpcb-scraper");
const util = require('util');
const fs = require('fs').promises;
const path = require('path');
const exec = util.promisify(require('child_process').exec);

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
            await getCSV(config.locations[i]);
        }
    }
    catch(err){
        logger.error(err);
    }
    // await mapCSV();
    return {msg:"All location scraped"};
}
async function mapCSV(args){
    // sed -i 's/$(_locname)/source_0.csv/g' ./mappings/cpcb.yml
    try{
        files = await fs.readdir(__dirname+"/Data/RawData/cpcb");
        for(i in files){
            logger.debug(files[i]);
            const { stdout1, stderr1 } = await exec('cp '+__dirname+"/../mappings/cpcb.yml "+ __dirname+"/../mappings/"+files[i]+".yml");
            if (stderr1) {
                logger.debug(`error: ${stderr}`);
            }
            let LocationIRI = files[i].split("_")[0];
            const { stdout2, stderr2 } = await exec("sed -i 's/_locname/"+LocationIRI+"/g' "+ __dirname+"/../mappings/"+files[i]+".yml");
            if (stderr2) {
                logger.debug(`error: ${stderr}`);
            }
            const { stdout3, stderr3 } = await exec("sed -i 's/_filename/"+files[i]+"/g' "+ __dirname+"/../mappings/"+files[i]+".yml");
            if (stderr3) {
                logger.debug(`error: ${stderr}`);
            }
        }
    }
    catch(err){
        logger.error(err);
    }
    return {
        msg:"OK"
    }
}
async function getCSV(location){
    // logger.debug(locName);
    let page;
    try {
        // console.log(browserInstance)
        page = await browserInstance.newPage();
        await page.goto(location.url,{ waitUntil: 'domcontentloaded' , timeout:60000});
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

        filename = location.IRI + "_" + Date.now()
        
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
        page.close();
        await retry(location,2);
    }
}
async function retry(location, retryCount) {
    logger.debug("retry no. "+retryCount.toString());
    try {
      return await getCSV(location);
    } catch (error) {
      if (retryCount <= 0) {
        throw error;
      }
      return await retry(location, retryCount - 1);
    }
  }
module.exports = {
    'scrape': scrape,
    'setBrowserInstance':setBrowserInstance,
    'mapCSV':mapCSV
}