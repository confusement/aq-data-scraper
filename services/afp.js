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
const haversine = require("haversine");
const csvEditor = require("./../scripts/csvEditor");
const copyFile = util.promisify(require("fs").copyFile);
const readFile = util.promisify(require("fs").readFile);
const unlink = util.promisify(require("fs").unlink);

//const config = require("../config/afp.json");
const localdb = require("./../dals/localdb");
const filedb = require("./../dals/filedb");

const browser = require("../services/browser");
let page;

const request = util.promisify(require("request"));

const replace = require("replace-in-file");

async function mapCSV(args) {
  console.log("Started Mapping");
  rdfFiles = [];
  try {
    files = await fsPromises.readdir(
      path.resolve(__dirname + "/Data/RawData/hysplit")
    );
    for (i in files) {
      if (!files[i].toString().endsWith("csv")) {
        continue;
      }
      //console.log(files[i] + " FILES!!!!!");

      //Load CSV
      var [tableCSV, numRows, numCols] = await csvEditor.loadCSV(
        path.resolve(__dirname + "/Data/RawData/hysplit/" + files[i])
      );
      if (tableCSV[numRows - 1].length != numCols) numRows -= 1;
      //Do changes
      //Append new column
      tableCSV[0].push("nextId");
      //Append value for each row
      let it = 0;
      tableCSV.forEach((row) => {
        //skip header
        if (it == 0) {
          it++;
          return;
        }
        if (row.length != numCols) return;

        if (it < numRows - 1) row.push((it + 1).toString());
        else row.push("null");

        it++;
      });

      //Save Changes
      await csvEditor.saveCSV(
        tableCSV,
        path.resolve(__dirname + "/Data/RawData/hysplit/" + "edit_" + files[i])
      );

      yarrmlFileName = path.resolve(
        __dirname + "/../mappings/" + files[i] + ".yml"
      );

      await copyFile(
        path.resolve(__dirname + "/../mappings/hysplit.yml"),
        yarrmlFileName
      );

      //Change this to suit HYSPLIT format
      let LocationIRI = files[i].split("_")[0];
      //console.log(LocationIRI);
      const replace_locname = {
        files: yarrmlFileName,
        from: /_locname/g,
        to: "place_" + LocationIRI,
      };
      await replace(replace_locname);

      const replace_filename = {
        files: yarrmlFileName,
        from: /_filename/g,
        to: "sources/Data/RawData/hysplit/" + "edit_" + files[i],
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
      await unlink(yarrmlFileName);

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

      await unlink(rmlMapFile);

      logger.debug(
        "java -jar lib/rmlmapper-4.9.3-r349-all.jar -s turtle -m " +
          rmlMapFile +
          " -o " +
          rdfFileName
      );

      logger.debug("Mapped :" + rdfFileName);
      console.log("turtleFileReady");
      turtleData = await readFile(rdfFileName);
      //logger.debug(turtleData);
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

      await unlink(__dirname + "/Data/RawData/hysplit/" + files[i]);

      rdfFiles.push(__dirname + "/../mappings/" + files[i] + ".rml.ttl");
    }
  } catch (err) {
    console.log(err);
  }
  return {
    msg: "OK",
    rdfFiles: rdfFiles,
  };
}

const toJSON = (csv) => {
  const lines = csv.split("\n");
  const result = [];
  const headers = lines[0].split(",");

  lines.map((l) => {
    const obj = {};
    const line = l.split(",");

    headers.map((h, i) => {
      obj[h] = line[i];
    });

    result.push(obj);
  });

  return JSON.stringify(result);
};

//var dir_name = __dirname + "/Data/RawData/hysplit";
//var fileId.dir = dir_name + "/ext";

//const config = require(__dirname + "/config/hysplit.json");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function mapnearby(inputFile, fileId) {
  let response = toJson(inputFile);
  //console.log(outputFile);
  const csvFileId = {
    src: "afp",
    ext: "csv",
    name: fileId.name,
    table: "RawData",
    IRI: fileId.IRI,
    path: "",
  };
  const tempCSVName = filedb.genFileName(csvFileId);
  const csvWriter = createCsvWriter({
    path: csvFileId.path,
    header: [
      { id: "timestamp", title: "timestamp" },
      { id: "longitude", title: "longitude" },
      { id: "latitude", title: "latitude" },
      { id: "frp", title: "frp" },
      { id: "uuid", title: "uuid" },
      { id: "confidence", title: "confidence" },
      { id: "bright_ti5", title: "ti5Brightness" },
      { id: "bright_ti4", title: "ti4Brightness" },
      { id: "nearby", title: "nearby" },
    ],
  });
  let [tableCSV, numRows, numCols] = await csvEditor.loadCSV(
    path.resolve(__dirname + "./../mappings/placesList.csv")
  );
  try {
    var res = response;
    var finObj = [];
    var uuids = [];
    var uuid_org = await uuidv4();
    var prev_uuid;
    for (var i = 1; i < res.length; i++) {
      var next_uuid = await uuidv4();
      var obj = res[i];
      if (obj["geometry"]["type"] == "Point") {
        temp = {};
        temp["uuid"] = next_uuid;
        temp["timestamp"] = res[i]["acq_date"];
        temp["frp"] = res[i]["frp"];
        temp["confidence"] = res[i]["confidence"];
        temp["bright_ti5"] = res[i]["ti5Brightness"];
        temp["bright_ti4"] = res[i]["ti4Brightness"];
        temp["latitude"] = res[i]["latitude"];
        temp["longitude"] = res[i]["longitude"];
        sourceCoords = {
          latitude: temp["latitude"],
          longitude: temp["longitude"],
        };
        minIRI = "null";
        minDist = 1000;
        for (const row of tableCSV) {
          destCoords = { latitude: row[1], longitude: row[2] };
          let dist = haversine(sourceCoords, destCoords);
          if (dist < minDist) {
            minDist = dist;
            minIRI = row[0];
          }
        }
        temp["nearby"] = "place_" + minIRI;
        finObj.push(temp);
      }
    }
  } catch (error) {
    page.close();
    logger.error(error);
  }

  csvWriter
    .writeRecords(finObj)
    .then(() =>
      logger.log("The CSV file " + csvFileId.name + " was written successfully")
    );

  return response;
}

var io_file_names = {};
var placeiri = {};

/**
 * @deprecated Use acquisition instead.
 */
async function scrape(args) {
  // Create new browser if not already running
  //await reloadBrowser();
  let totalLocations = 0;
  let retryCount = 0;
  try {
    //await getKMZ(config.locations[0]);
    for (i in config.locations) {
      console.log(config.locations[i]);
      let res = await getKMZ(config.locations[i]);
      var inp = path.resolve(
        __dirname + "/Data/RawData/hysplit/" + res + ".kmz"
      );
      var opt = path.resolve(dir_name + "/" + res + ".csv");
      io_file_names[inp] = opt;
      placeiri[inp] = config.locations[i]["IRI"];
    }
  } catch (err) {
    logger.error(err);
  }
  return { msg: "All location scraped" };
}

async function initializeJobs() {
  try {
    jobs = [];
    for (location of config.locations) {
      let newID = await localdb.generateID();
      jobs.push({
        id: newID,
        stages: {
          acquisition: {
            status: "I",
            comment: "Not started",
            retriesLeft: 5,
            data: {
              url: location.url,
              State: location.State,
              City: location.City,
              StationName: location.StationName,
            },
          },
          preprocess: {
            status: "I",
            comment: "Not started",
            retriesLeft: 1,
            data: {},
          },
          mapOntology: {
            status: "I",
            comment: "Not started",
            retriesLeft: 1,
            data: {},
          },
        },
      });
    }
    return jobs;
  } catch (err) {
    logger.error(err);
  }
}

// Rename to acquisition
async function acquisition() {
  console.log("AFP acquisition called");
  try {
    console.log("got page");
    const filename = "South_Asia" + "_" + Date.now();
    let fileId = {
      src: "afp",
      ext: "csv",
      name: filename,
      table: "Temp",
      path: "",
      dir: "",
    };
    console.log(fileId);
    let fnPath = filedb.genFileName(fileId);
    !fs.existsSync(fileId.dir) && fs.mkdirSync(fileId.dir, { recursive: true });
    console.log(fnPath);
    const file = fs.createWriteStream(path.resolve(fileId.path));
    const request = https.get(
      "https://firms.modaps.eosdis.nasa.gov/data/active_fire/noaa-20-viirs-c2/csv/J1_VIIRS_C2_South_Asia_24h.csv",
      function (response) {
        response.pipe(file);
      }
    );
    //filedb.writeToDB(db, fileId);
    await sleep(5000);
    await mapnearby(file);

    // let inp = fileId.path;
    // var opt = path.resolve(dir_name + "/" + res + ".csv");
    // io_file_names[inp] = opt;
    // placeiri[inp] = location.IRI;
    return {
      result: "Success",
    };
  } catch (err) {
    logger.debug(err);
    console.log(err);
    return {
      result: "Failure",
      error: err,
    };
  }
}

// kmltocsv(
//   "Data\\RawData\\hysplit\\ext\\HYSPLITtraj_154279_01.kml",
//   "Data\\RawData\\hysplit\\testing_uuid.csv"
// );

async function tester() {
  await acquisition();
}

tester();

module.exports = {
  initializeJobs: initializeJobs,
  acquisition: acquisition,
  mapCSV: mapCSV,
};
