const puppeteer = require('puppeteer');
const log4js = require('log4js');
const logger = log4js.getLogger("stationList-script");
const util = require('util');
const fs = require("fs").promises;
const copyFile = util.promisify(require('fs').copyFile);
const unlink = util.promisify(require('fs').unlink)
const readFile = util.promisify(require('fs').readFile)
const path = require("path");

var browserInstance = null;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
async function reloadBrowser(){
    console.log( path.resolve(__dirname + "/../lib/ezio-data"));
    if(!browserInstance)
        browserInstance = await puppeteer.launch({
            headless: false ,
            userDataDir: path.resolve(__dirname + "/../lib/ezio-data"),
            // args: ['--user-data-dir=C:\\Users\\Sudhir\\AppData\\Local\\Google\\Chrome\\User\ Data\\Default'],
            executablePath: path.resolve(__dirname + "/../lib/chrome-win/chrome.exe"),
            // executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
            // executablePath: __dirname+'/../lib/chrome-win/chrome.exe',
            // args: ['--start-maximized']
        });
}
async function loadCSV(filename) {
    rawData = await readFile(filename);
    tableCSV = rawData.toString().split("\n").map((row) => row.split(","));
    numRows = tableCSV.length;
    numCols = tableCSV[0].length;
    return [tableCSV,numRows,numCols]
}
async function saveCSV(tableCSV,filename){
    rawData = tableCSV.map((row) => row.join(",")).join("\n");
    await fs.writeFile(filename,rawData.toString())
}
async function combineCSVs(){
    allcsv = await fs.readdir(path.resolve(__dirname + "/../eziodata"));
    allDataTable = [
        ["pm1_0","pm2_5","pm10","temp","humid","location","timestamp"]
    ]
    for (const file of allcsv) {
        if(file==="temp")
            continue;
        if(file==="combined")
            continue;
        let location = file;
        [tableCSV,numRows,numCols] = await loadCSV(path.resolve(__dirname + "/../eziodata/"+file))
        let it = 0;
        for(const row of tableCSV){
            if(it!=0){
                newRow = [row[0],row[1],row[2],row[3],row[4],location,row[6]]
                allDataTable.push(newRow);
            }
            it++
        }
    }
    await saveCSV(allDataTable,path.resolve(__dirname + "/../eziodata/combined/db.csv"));
    console.log("Done")
}
async function runScript(){
    await reloadBrowser();
    let page = await browserInstance.newPage();

    let iter = 1;
    locations = [
        {
            name:"Jharoda_Kalan",
            baseURL:"https://eziostat.aerogram.in/devices/84:cc:a8:36:b0:e4/dashboard"
        },
        {
            name:"DTC_bus_terminal",
            baseURL:"https://eziostat.aerogram.in/devices/84:cc:a8:36:b0:c0/dashboard"
        },
        {
            name:"Nangli_Dairy",
            baseURL:"https://eziostat.aerogram.in/devices/84:cc:a8:36:b0:c4/dashboard"
        },
        {
            name:"ShaheenBagh",
            baseURL:"https://eziostat.aerogram.in/devices/9c:9c:1f:ef:b7:38/dashboard"
        },
        {
            name:"Sanjay_Colony_2",
            baseURL:"https://eziostat.aerogram.in/devices/c4:4f:33:7b:62:a9/dashboard"
        },
        {
            name:"Tekhand2",
            baseURL:"https://eziostat.aerogram.in/devices/9c:9c:1f:ef:ba:84/dashboard"
        },
    ]
    currentMonth = 11;
    dateNows = [

    ]
    // for(let day=2;day<=31;day++){
    //     dateNows.push([day.toString(),-1]);
    // }
    for(let day=14;day<=21;day++){
        dateNows.push([day.toString(),0]);
    }
    // console.log(dateNows)
    // return;
    const WAIT_TIME = 100;
    try{
        for (const location of locations) {
            await page.goto(location.baseURL,{ waitUntil: 'domcontentloaded' , timeout:60000});
            await page.waitForSelector('.MuiInputBase-input');
            await sleep(25000);

            // console.log("Time set ended")
            // await page.evaluate(() => {
            //     var clickEvent = document.createEvent('MouseEvents');
            //     clickEvent.initEvent("mousedown", true, true);
            //     var selectNode = document.querySelectorAll(".MuiOutlinedInput-input:nth-child(1)")[1];
            //     selectNode.dispatchEvent(clickEvent);
            //     [...document.querySelectorAll('li')].filter(el => el.innerText == "Custom")[0].click();
            // });
            
            console.log("Should be custom now")
            let curMonthDiff = 0;
            for (const datenow of dateNows) {
                // console.log("fir",datenow[0]);
                // console.log("sec",datenow[1]);

                const fulldate = datenow[0]+ "-" + (currentMonth+datenow[1]).toString() + "-2021";
                await page.waitForSelector('#date-picker');
                await sleep(WAIT_TIME);

                const DateTimeButtons = await page.$$('.MuiInputBase-root:nth-child(1)');

                await DateTimeButtons[0].click();

                await page.waitForSelector('.MuiPickersBasePicker-container');
                await page.waitForSelector('.MuiIconButton-root:nth-child(1)');
                await sleep(WAIT_TIME);
  
                const backMonthButton = await page.$$('.MuiIconButton-root:nth-child(1)');
                const forwardMonthButton = await page.$$('.MuiIconButton-root:nth-child(3)');

                console.log(datenow[1],curMonthDiff,"bef")
                while(datenow[1]>curMonthDiff){
                    await forwardMonthButton[0].click();
                    curMonthDiff++;
                    await sleep(2000);
                }
                console.log(datenow[1],curMonthDiff,"mid")
                while(datenow[1]<curMonthDiff){
                    await backMonthButton[0].click();
                    curMonthDiff--;
                    await sleep(2000);
                }
                console.log(datenow[1],curMonthDiff,"aft")

                const [dateButton] = await page.$x("//button[@tabindex='0']/span/p[text()='"+datenow[0]+"']");
                await dateButton.click();
                await sleep(WAIT_TIME);
                
                const [okButton] = await page.$x("//button/span[contains(., 'OK')]");
                await okButton.click();
                await sleep(WAIT_TIME);
                
                // await DateTimeButtons[1].click();
                // await sleep(3000);

                await page._client.send('Page.setDownloadBehavior', {
                    behavior: 'allow',
                    downloadPath: path.resolve(__dirname + "/../eziodata/temp") 
                });
                await sleep(3000);

                try{
                    await page.click('.MuiFab-primary');
                
                    await sleep(3000);
            
                    downloadedFile = (await fs.readdir(path.resolve(__dirname + "/../eziodata/temp")))[0];
                    await fs.rename(
                        path.resolve(__dirname + "/../eziodata/temp/"+downloadedFile),
                        path.resolve(__dirname + "/../eziodata/"+location.name+" "+fulldate)
                    );
                    await sleep(WAIT_TIME);
                }
                catch(err){
                    console.log("Failed at: "+location.name +" date: "+fulldate);
                }
            }
        }

    }
    catch (err){
        logger.error(err);
    }
}
module.exports = {
    'runScript': runScript,
    'combineCSVs':combineCSVs
}