const log4js = require('log4js');
const logger = log4js.getLogger("cpcb-scraper");
const fs = require('fs').promises;
const util = require('util');
const copyFile = util.promisify(require('fs').copyFile);
const unlink = util.promisify(require('fs').unlink)
const readFile = util.promisify(require('fs').readFile)
const haversine = require('haversine')
var path = require("path");
centerPoint = {latitude : 28.6,longitude:77.13333};

var nans = 0
async function getCoords(row){
    let i = 1;
    let coords = {latitude : 28.6,longitude:77.13333};
    let flag = true;
    let stoppage = 1;
    while(i<row.length){
        //console.log(row[i],!isNaN(parseFloat(row[i])))
        if(!isNaN(parseFloat(row[i]))){
            flag = false;
            coords = {latitude : parseFloat(row[i]),longitude:parseFloat(row[i+1])};
            stoppage = i;
            break;
        }
        i++;
    }
    if(flag)
        nans++;
    return [coords,stoppage];
}
async function main(){
    try{
        const geoData = await readFile(path.resolve(__dirname + "/../sources/geonames/IN.txt"));
        const matrix = geoData.toString().split("\n").map((row) => row.split("\t"));
        console.log(matrix[1])
        console.log("Loaded Matrix");
        let subset = [];
        let count = 0
        let iter = 0;

        for(const row of matrix){
            // if(iter>10)
            //     break;
            [rowCoords,stoppage] = await getCoords(row);
            let dist = haversine(centerPoint,rowCoords);
            if(dist<250){
                count++;
                let name = row.slice(1,stoppage).join(" ").split(",").join(" ");
                subset.push([name,rowCoords.latitude,rowCoords.longitude]);
                // console.log(iter,[row.slice(1,stoppage).join(),rowCoords.latitude,rowCoords.longitude]);
            }
            iter++;
        }
        console.log(count)
        console.log(nans);
        saveCSV(subset,"outputPlaces.csv")
    }
    catch(err){
        console.log("ERR:",err);
    }
}
async function computeNearby(){
    
}
async function saveCSV(tableCSV,filename){
    rawData = tableCSV.map((row) => row.join(",")).join("\n");
    await fs.writeFile(filename,rawData.toString())
}
module.exports = {
    'main': main,
}