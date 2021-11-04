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
        ["day","month","ShaheenBagh","DTC_bus_terminal","Nangli_Dairy","Jharoda_Kalan","Sanjay_Colony_2","Tekhand2"]
    ];
    // dateNows = ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15',
                // '16','17','18','19','20','21','22','23','24','25','26','27','28']
    currentMonth = 11;
    dateNows = []
    for(let day=1;day<=31;day++){
        dateNows.push([day.toString(),-1]);
    }
    for(let day=1;day<=4;day++){
        dateNows.push([day.toString(),0]);
    }
    for (const datenow of dateNows) {
        densityStats.push([datenow[0]+"-"+(datenow[1]+currentMonth).toString(),"0","0","0","0","0","0"])
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
        let month = date.split("-")[1];
        [tableCSV,numRows,numCols] = await loadCSV(path.resolve(__dirname + "/../eziodata/"+file))
        let it = 0;
        
        let ndex = (month==10)?(parseInt(day)):(31+parseInt(day));
        densityStats[ndex][locationMap[location]] = numRows.toString();
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
            name:"Jharoda_Kalan",
            baseURL:"https://eziostat-dev.web.app/devices/84:cc:a8:36:b0:e4"
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
            name:"ShaheenBagh",
            baseURL:"https://eziostat-dev.web.app/devices/84:cc:a8:57:c2:54"
        },
        {
            name:"Sanjay_Colony_2",
            baseURL:"https://eziostat-dev.web.app/devices/c4:4f:33:7b:62:a9"
        },
        {
            name:"Tekhand2",
            baseURL:"https://eziostat-dev.web.app/devices/9c:9c:1f:ef:ba:84"
        },
    ]
    currentMonth = 11;
    dateNows = [
        ["1",-1],
        ["1",0]
    ]
    for(let day=2;day<=31;day++){
        dateNows.push([day.toString(),-1]);
    }
    for(let day=2;day<=4;day++){
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