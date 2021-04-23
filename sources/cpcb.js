const log4js = require('log4js');
const logger = log4js.getLogger("cpcb-scraper");
const util = require('util');
const fs = require('fs').promises;
const path = require('path');

const exec = util.promisify(require('child_process').exec);
const copyFile = util.promisify(require('fs').copyFile);
const unlink = util.promisify(require('fs').unlink)

const replace = require('replace-in-file');

const puppeteer = require('puppeteer');

var browserInstance = null;
async function reloadBrowser(){
    if(!browserInstance)
        browserInstance = await puppeteer.launch({
            headless: false ,
            // executablePath: __dirname+'/../lib/chrome-linux/chrome',
            executablePath: __dirname+'/../lib/chrome-win/chrome.exe',
            // args: ['--start-maximized']
        });
}
const config = require(__dirname+'/config/cpcb.json')

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
async function scrape(args){
    // Create new browser if not already running
    let totalLocations = 0;
    let retryCount = 0;
    await reloadBrowser();
    try{
        for(i in config.locations){
            retryCount += await getCSV(config.locations[i]);
            totalLocations++;
        }
    }
    catch(err){
        logger.error(err);
    }
    // await mapCSV();
    return {
        msg:"All location scraped",
        retryCount:retryCount
    };
}
async function mapCSV(args){
    // sed -i 's/$(_locname)/source_0.csv/g' ./mappings/cpcb.yml
    logger.debug("Started Mapping");
    rdfFiles = []
    try{
        files = await fs.readdir(__dirname+"/Data/RawData/cpcb");
        for(i in files){
            logger.debug(files[i]);
            yarrmlFileName = path.resolve(__dirname+"/../mappings/"+files[i]+".yml");

            await copyFile(path.resolve(__dirname+"/../mappings/cpcb.yml"),yarrmlFileName)

            //Deprecated
            // const { stdout1, stderr1 } = await exec('cp '+__dirname+"/../mappings/cpcb.yml "+ __dirname+"/../mappings/"+files[i]+".yml");
            // if (stderr1) {
            //     logger.debug(`error: ${stderr}`);
            // }

            let LocationIRI = files[i].split("_")[0];
            const replace_locname = {
                files: yarrmlFileName,
                from: /_locname/g,
                to: LocationIRI,
              };
            await replace(replace_locname)

            //Deprecated
            // const { stdout2, stderr2 } = await exec("sed -i 's/_locname/"+LocationIRI+"/g' "+ yarrmlFileName);
            // if (stderr2) {
            //     logger.debug(`error: ${stderr}`);
            // }

            const replace_filename = {
                files: yarrmlFileName,
                from: /_filename/g,
                to: "sources/Data/RawData/cpcb/"+files[i],
              };
            await replace(replace_filename)

            var location = config.locations.find(search => {return search.IRI === LocationIRI})

            const replace_station = {
                files: yarrmlFileName,
                from: /_station/g,
                to: location.StationCode,
              };
            await replace(replace_filename)

            // const { stdout3, stderr3 } = await exec("sed -i 's/_filename/"+files[i]+"/g' "+ yarrmlFileName);
            // if (stderr3) {
            //     logger.debug(`error: ${stderr}`);
            // }

            let rmlMapFile = path.resolve(__dirname+"/../mappings/"+files[i]+".rml.ttl");

            const { stdout3, stderr3 } = await exec(
                "yarrrml-parser -i "+yarrmlFileName+" -o "+rmlMapFile,
                {
                    cwd: __dirname+"/..",
                });0
            if (stderr3) {
                logger.debug(`error: ${stderr}`);
            }
            
            await unlink(yarrmlFileName);

            let rdfFileName = path.resolve(__dirname +"/../sources/Data/RdfData/cpcb/" + files[i] +".turtle");

            const { stdout4, stderr4 } = await exec(
                "java -jar lib/rmlmapper-4.9.3-r349-all.jar -s turtle -m "+rmlMapFile+" -o "+rdfFileName,
                {
                    cwd: path.resolve(__dirname+"/.."),
                });
            if (stderr4) {
                logger.debug(`error: ${stderr}`);
            }

            // await unlink(rmlMapFile);

            logger.debug("java -jar lib/rmlmapper-4.9.3-r349-all.jar -s turtle -m "+rmlMapFile+" -o "+rdfFileName);

            logger.debug("Mapped :" +rdfFileName);
            rdfFiles.push(__dirname+"/../mappings/"+files[i]+".rml.ttl")
        }
    }
    catch(err){
        logger.error(err);
    }
    return {
        msg:"OK",
        rdfFiles:rdfFiles
    }
}
async function getCSV(location){
    // logger.debug(locName);
    let retryCount = 0;
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
        await sleep(1500);
        await page.evaluate(() => document.querySelector('.pure-checkbox.select-all').click())
        await sleep(1500);
        // await page.click('.c-btn')
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
        logger.debug(tableString);
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
        
        await sleep(10000);
        page.close();
    }
    catch(err){
        logger.error(err);
        page.close();
        await retry(location,5);
        retryCount++;
    }
    return retryCount;
}
async function retry(location, retryCount) {
    logger.debug("retry no. "+retryCount.toString());
    try {
      return await getCSV(location);
    } catch (error) {
      if (retryCount <= 0) {
        logger.error("Retries exhausted for location: ",location.StationName," : source cpcb");
      }
      return await retry(location, retryCount - 1);
    }
  }
module.exports = {
    'scrape': scrape,
    'mapCSV':mapCSV
}