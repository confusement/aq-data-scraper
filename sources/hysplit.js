const log4js = require("log4js");
//const logger = log4js.getLogger("hysplit-scraper");
const util = require("util");
const http = require("http");
const https = require("https"); // or 'https' for https:// URLs
const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");
const exec = util.promisify(require("child_process").exec);
const puppeteer = require("puppeteer");
var url = require("url");
const extract = require("extract-zip");
const parseKML = require("parse-kml");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const logger = log4js.getLogger("kml-parser");
const haversine = require('haversine')
const csvEditor = require("./../scripts/csvEditor")

const copyFile = util.promisify(require("fs").copyFile);
const readFile = util.promisify(require("fs").readFile);

const request = util.promisify(require("request"));

const replace = require("replace-in-file");

var browserInstance = null;
async function reloadBrowser() {
  if (!browserInstance)
    browserInstance = await puppeteer.launch({
      headless: false,
      //executablePath: __dirname + "/../lib/chrome-linux/chrome",
      executablePath: __dirname + "/../lib/chrome-win/chrome.exe",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
}
async function mapCSV(args) {
  console.log("Started Mapping");
  rdfFiles = [];
  try {
    files = await fsPromises.readdir(path.resolve(__dirname + "/Data/RawData/hysplit"));
    for (i in files) {
      if(!files[i].toString().endsWith("csv")){
        continue;
      }
      console.log(files[i]);

        //Load CSV
      var [tableCSV,numRows,numCols] = await csvEditor.loadCSV(path.resolve(__dirname + "/Data/RawData/hysplit/" + files[i]));
      if(tableCSV[numRows-1].length!=numCols)
        numRows-=1
      //Do changes
      //Append new column
      tableCSV[0].push("nextId")
      //Append value for each row
      let it = 0;
      tableCSV.forEach(row => {
        //skip header
        if(it==0){
          it++;
          return;
        } 
        if(row.length!=numCols)
          return;

        if(it<numRows-1)
          row.push((it+1).toString())
        else
          row.push("null")
          
        it++;
      });

      //Save Changes
      await csvEditor.saveCSV(tableCSV,path.resolve(__dirname + "/Data/RawData/hysplit/" + "edit_"+files[i]))

      yarrmlFileName = path.resolve(
        __dirname + "/../mappings/" + files[i] + ".yml"
      );

      await copyFile(
        path.resolve(__dirname + "/../mappings/hysplit.yml"),
        yarrmlFileName
      );

      //Change this to suit HYSPLIT format
      let LocationIRI = files[i].split("_")[0];
      const replace_locname = {
        files: yarrmlFileName,
        from: /_locname/g,
        to: LocationIRI,
      };
      await replace(replace_locname);

      const replace_filename = {
        files: yarrmlFileName,
        from: /_filename/g,
        to: "sources/Data/RawData/hysplit/" + files[i],
      };
      await replace(replace_filename);

      let rmlMapFile = path.resolve(
        __dirname + "/../mappings/" + files[i] + ".rml.ttl"
      );

      const { stdout3, stderr3 } = await exec(
        "yarrrml-parser -i " + yarrmlFileName + " -o " + rmlMapFile,
        {
          cwd: __dirname + "/..",
        }
      );
      0;
      if (stderr3) {
        logger.debug(`error: ${stderr}`);
      }

      // await unlink(yarrmlFileName);

      let rdfFileName = path.resolve(
        __dirname + "/../sources/Data/RdfData/hysplit/" + files[i] + ".turtle"
      );

      const { stdout4, stderr4 } = await exec(
        "java -jar lib/rmlmapper-4.9.3-r349-all.jar -s turtle -m " +
          rmlMapFile +
          " -o " +
          rdfFileName,
        {
          cwd: path.resolve(__dirname + "/.."),
        }
      );
      if (stderr4) {
        logger.debug(`error: ${stderr}`);
      }

      // await unlink(rmlMapFile);

      logger.debug(
        "java -jar lib/rmlmapper-4.9.3-r349-all.jar -s turtle -m " +
          rmlMapFile +
          " -o " +
          rdfFileName
      );

      logger.debug("Mapped :" + rdfFileName);

      turtleData = await readFile(rdfFileName);
      logger.debug(turtleData);
      var options = {
        method: "POST",
        url: "http://localhost:3030/aqStore/data?default",
        headers: {
          "Content-Type": "text/turtle;charset=utf-8",
        },
        formData: {
          data: {
            value: turtleData,
            options: {
              filename: rdfFileName,
              contentType: "text/turtle;charset=utf-8",
            },
          },
        },
      };

      let turtleResponse = await request(options);
      logger.debug("Response from fuseki : [" + turtleResponse.body + "]");

      // await unlink(__dirname + "/Data/RawData/hysplit/" + files[i]);

      rdfFiles.push(__dirname + "/../mappings/" + files[i] + ".rml.ttl");
    }
  } catch (err) {
    console.log(err)
  }
  return {
    msg: "OK",
    rdfFiles: rdfFiles,
  };
}

var dir_name = __dirname + "/Data/RawData/hysplit";
var directory = dir_name + "/ext";

async function kmztokml(inputFile, outPutFileName, orgPlace1) {
  try {
    console.log(
      "IM HERE" + inputFile + "   " + outPutFileName + " " + orgPlace1
    );
    await extract(inputFile, {
      dir: dir_name + "/ext",
    });
    console.log("Extraction complete");
    
    fs.readdir(directory, (err, files) => {
      if (err){
        throw err;
      } 
      var kmlFileName = "";
      for (const file of files) {
        if (
          path.join(directory, file).includes(".png") ||
          path.join(directory, file).includes(".gif")
        ) {
          console.log(path.join(directory, file));
          try {
            fs.unlink(path.join(directory, file));
          } catch (err) {
            console.log(err);
          }
        }
        if (path.join(directory, file).includes(".kml")) {
          kmlFileName = path.join(directory, file);
        }
      }
      kmltocsv(kmlFileName, outPutFileName, orgPlace1);
    });

  } catch (err) {
    console.log(err);
  }
}

async function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function kmltocsv(inputFile, outputFile, orgPlace) {
  let response = await parseKML.toJson(inputFile);
  console.log(outputFile);
  const csvWriter = createCsvWriter({
    path: outputFile,
    header: [
      { id: "timestamp", title: "timestamp" },
      { id: "longitude", title: "longitude" },
      { id: "latitude", title: "latitude" },
      { id: "height", title: "height" },
      { id: "uuid", title: "uuid" },
      { id: "nextuuid", title: "nextuuid" },
      { id: "firstlast", title: "firstlast" },
      { id: "orgplaceiri", title: "orgplaceiri" },
      { id: "nearby", title: "nearby" },
    ],
  });
  let [tableCSV,numRows,numCols] = await csvEditor.loadCSV(path.resolve(__dirname+"./../mappings/placesList.csv"))
  console.log(tableCSV[1])
  try {
    var res = response["features"];
    var finObj = [];
    var uuids = [];
    console.log(res.length);
    // for (let index = 0; index < res.length; index++) {
    //   console.log("fuck");
    //   uuids[index] = await uuidv4();
    // }
    console.log(uuids);
    var uuid_org = await uuidv4();
    var prev_uuid;
    //console.log(response["features"]);
    for (var i = 1; i < res.length; i++) {
      var next_uuid = await uuidv4();
      var obj = res[i];
      if (obj["geometry"]["type"] == "Point") {
        temp = {};
        if (obj["properties"]["timespan"] == null) {
          temp["timestamp"] = res[i + 1]["properties"]["timespan"]["end"];
        } else {
          temp["timestamp"] = obj["properties"]["timespan"]["begin"];
        }
        temp["longitude"] = obj["geometry"]["coordinates"][0];
        temp["latitude"] = obj["geometry"]["coordinates"][1];
        temp["height"] = obj["geometry"]["coordinates"][2];
        temp["orgplaceiri"] = orgPlace;
        if (i == 1) {
          temp["firstlast"] = "first";
          temp["uuid"] = uuid_org;
          temp["nextuuid"] = next_uuid;
          prev_uuid = next_uuid;
        } else {
          temp["uuid"] = prev_uuid;
          temp["nextuuid"] = next_uuid;
          prev_uuid = next_uuid;
          if (i == res.length - 1) {
            temp["firstlast"] = "last";
          } else {
            temp["firstlast"] = "mid";
          }
        }

        sourceCoords = {latitude: temp["latitude"], longitude : temp["longitude"]}
        minIRI = "null";
        minDist = 1000;
        for(const row of tableCSV){
          destCoords = {latitude: row[1], longitude :row[2]}
          let dist = haversine(sourceCoords,destCoords);
          if(dist<minDist)
          {
            minDist = dist;
            minIRI = row[0];
          }
        }
        temp['nearby'] = "place_"+minIRI;
        finObj.push(temp);
      }
    }
  } catch (error) {
    logger.error(error);
  }

  csvWriter
    .writeRecords(finObj)
    .then(() =>
      logger.log("The CSV file " + outputFile + " was written successfully")
    );

  return response;
}
const config = require(__dirname + "/config/hysplit.json");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

var io_file_names = {};
var placeiri = {};
async function scrape(args) {
  // Create new browser if not already running
  await reloadBrowser();
  try {
    //await getKMZ(config.locations[0]);
    for (i in config.locations) {
      console.log(config.locations[i]);
      let res = await getKMZ(config.locations[i]);
      var inp = path.resolve(__dirname + "/Data/RawData/hysplit/" + res + ".kmz");
      var opt = path.resolve(dir_name + "/" + res + ".csv");
      io_file_names[inp] = opt;
      placeiri[inp] = config.locations[i]["IRI"];
    }
  } catch (err) {
    logger.error(err);
  }
  return { msg: "All location scraped" };
}

async function convertKMZ() {
  console.log(io_file_names + " iofilenames");
  Object.keys(io_file_names).forEach(function (key) {
    console.log("Key : " + key + ", Value : " + io_file_names[key]);
    kmztokml(key, io_file_names[key], placeiri[key]);
  });
  // kmztokml(path.resolve(__dirname+'/Data/RawData/hysplit/ito_1623066641515.kmz').toString(),
  // path.resolve(__dirname+'/Data/RawData/hysplit/ito_1623066641515_new.csv').toString(),
  //  'ito');
}

async function getKMZ(location) {
  let page;
  try {
    page = await browserInstance.newPage();
    const hysplit_url =
      "https://www.ready.noaa.gov/hypub-bin/trajtype.pl?runtype=archive";
    await page.goto(hysplit_url, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await sleep(2000);
    await page.waitForSelector('Input[value="Next>>"]');
    await page.click('Input[value="Next>>"]');
    await page.waitForSelector('select[name="metdata"]');

    await page.select('select[name="metdata"]', "GFS0p25");
    const lat = location.latitude;
    const long = location.longitude;
    await page.$eval(
      "input[id=LonId]",
      (el, value) => (el.value = value),
      long
    );
    await page.$eval("input[id=LatId]", (el, value) => (el.value = value), lat);
    await page.select("#ewId", "E");
    await page.waitForSelector('Input[value="Next>>"]');
    await page.click('Input[value="Next>>"]');
    await sleep(1000);
    await page.waitForSelector('Input[value="Next>>"]');
    await page.click('Input[value="Next>>"]');
    await page.waitForSelector('Input[value="Backward"]',{timeout:60000});
    await page.click('Input[value="Backward"]');
    await page.$eval(
      "input[name='duration']",
      (el, value) => (el.value = value),
      "24"
    );

    await page.evaluate(() =>
      document
        .querySelector(
          "#page_center > table > tbody > tr > td > div.page_content > form > div:nth-child(5) > table:nth-child(3) > tbody > tr:nth-child(1) > td:nth-child(3) > input[type=RADIO]"
        )
        .click()
    );
    await page.waitForSelector(
      'Input[value="Request trajectory (only press once!)"]'
    );
    await page.click('Input[value="Request trajectory (only press once!)"]');

    await page.waitForSelector(
      "#page_center > table > tbody > tr > td > div.page_content > table:nth-child(4) > tbody > tr > td > font > table > tbody > tr:nth-child(3) > td:nth-child(4) > font > b > a",
      {
        timeout: 120000,
      }
    );
    await sleep(5000);
    console.log(page.url());

    const queryString = new URL(page.url());
    const params = queryString.searchParams;
    var jobno = "";
    for (const param of params) {
      if ("jobidno" === param[0]) {
        jobno = param[1];
      }
    }
    const filename = location.IRI + "_" + Date.now();
    const file = fs.createWriteStream(
      path.resolve(__dirname + "/Data/RawData/hysplit/" + filename + ".kmz")
    );
    const request = https.get(
      "https://www.ready.noaa.gov/hypubout/HYSPLITtraj_" + jobno + ".kmz",
      function (response) {
        response.pipe(file);
      }
    );
    await sleep(5000);
    page.close();
    return filename;
  } catch (err) {
    page.close();
    console.log(err);
  }
}

// kmltocsv(
//   "Data\\RawData\\hysplit\\ext\\HYSPLITtraj_154279_01.kml",
//   "Data\\RawData\\hysplit\\testing_uuid.csv"
// );
async function execute_fin() {
  //await scrape();
  //await convertKMZ();
  let mappingResult = await mapCSV({});
  //await browserInstance.close();
}
execute_fin();
