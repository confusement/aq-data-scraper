const log4js = require('log4js');
const logger = log4js.getLogger("cpcb-scraper");
const util = require('util');
const fs = require('fs').promises;
const copyFile = util.promisify(require('fs').copyFile);
const unlink = util.promisify(require('fs').unlink)
const readFile = util.promisify(require('fs').readFile)

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
    console.log(rawData);
}
module.exports = {
    'loadCSV': loadCSV,
    'saveCSV': saveCSV
}