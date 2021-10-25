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
        ["pm1_0","pm2_5","pm10","temp","humid","date","location","timestamp"]
    ]
    densityStats = [
        ["day","ShaheenBagh","DTC_bus_terminal","Nangli_Dairy","Jharoda_Kalan","Sanjay_Colony_2","Tekhand2"]
    ];
    dateNows = ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15',
    '16','17','18','19','20','21','22','23']
    for (const datenow of dateNows) {
        densityStats.push([datenow,"0","0","0","0","0","0"])
    }
    locationMap ={
        "ShaheenBagh":1,
        "DTC_bus_terminal":2,
        "Nangli_Dairy":3,
        "Jharoda_Kalan":4,
        "Sanjay_Colony_2":5,
        "Tekhand2":6
    }
    for (const file of allcsv) {
        if(file==="temp")
            continue;
        if(file==="combined")
            continue;
        let location = file.split(" ")[0];
        let date = file.split(" ")[1];
        let day = date.split("-")[0];
        [tableCSV,numRows,numCols] = await loadCSV(path.resolve(__dirname + "/../eziodata/"+file))
        let it = 0;
        
        densityStats[parseInt(day)][locationMap[location]] = numRows.toString();
        for(const row of tableCSV){
            if(it!=0){
                newRow = [row[0],row[1],row[2],row[3],row[4],date,location,row[6]]
                allDataTable.push(newRow);
            }
            it++
        }
    }
    await saveCSV(allDataTable,path.resolve(__dirname + "/../eziodata/combined/db.csv"));
    await saveCSV(densityStats,path.resolve(__dirname + "/../eziodata/combined/densityStats.csv"))
    console.log("Done")
}
async function runScript(){
    await reloadBrowser();
    let page = await browserInstance.newPage();

    let iter = 1;
    locations = [
        {
            name:"ShaheenBagh",
            baseURL:"https://eziostat-dev.web.app/devices/04:cc:a8:57:c2:54"
        },
        {
            name:"DTC_bus_terminal",
            baseURL:"https://eziostat-dev.web.app/devices/84:cc:a8:36:b0:c0"
        },
        {
            name:"Nangli_Dairy",
            baseURL:"https://eziostat-dev.web.app/devices/84:cc:a8:36:b0:c4"
        },
        {
            name:"Jharoda_Kalan",
            baseURL:"https://eziostat-dev.web.app/devices/84:cc:a8:36:b0:e4"
        },
        {
            name:"Sanjay_Colony_2",
            baseURL:"https://eziostat-dev.web.app/devices/84:cc:a8:57:c2:54"
        },
        {
            name:"Tekhand2",
            baseURL:"https://eziostat-dev.web.app/devices/9c:9c:1f:ef:ba:84"
        },
    ]
    dateNows = ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15',
                '16','17','18','19','20','21','22','23']
    try{
        for (const location of locations) {
            await page.goto(location.baseURL,{ waitUntil: 'domcontentloaded' , timeout:60000});
            await page.waitForSelector('.MuiInputBase-input');
            await sleep(15000);

            await page.evaluate(() => {
                var clickEvent = document.createEvent('MouseEvents');
                clickEvent.initEvent("mousedown", true, true);
                var selectNode = document.querySelectorAll(".MuiOutlinedInput-input:nth-child(1)")[1];
                selectNode.dispatchEvent(clickEvent);
                [...document.querySelectorAll('li')].filter(el => el.innerText == "Custom")[0].click();
            });
            
            for (const datenow of dateNows) {
                const fulldate = datenow + "-10-2021";
                await page.waitForSelector('#date-picker');
                await sleep(1000);

                await page.click('.MuiInputBase-root:nth-child(1)');

                await page.waitForSelector('.MuiPickersBasePicker-container');
                await sleep(500);

                const [dateButton] = await page.$x("//button/span/p[contains(., '"+datenow+"')]");
                await dateButton.click();
                await sleep(500);
                
                const [okButton] = await page.$x("//button/span[contains(., 'OK')]");
                await okButton.click();
                await sleep(500);
                
                await page._client.send('Page.setDownloadBehavior', {
                    behavior: 'allow',
                    downloadPath: path.resolve(__dirname + "/../eziodata/temp") 
                });
                await sleep(2000);

                try{
                    await page.click('.MuiFab-primary');
                
                    await sleep(2000);
            
                    downloadedFile = (await fs.readdir(path.resolve(__dirname + "/../eziodata/temp")))[0];
                    await fs.rename(
                        path.resolve(__dirname + "/../eziodata/temp/"+downloadedFile),
                        path.resolve(__dirname + "/../eziodata/"+location.name+" "+fulldate)
                    );
                    await sleep(500);
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