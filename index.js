const port = 5001;
// const port=process.env.PORT;
var express = require("express");
var path = require("path");
var log4js = require("log4js");
const cors = require("cors");
var app = express();
app.use(cors());
app.options("*", cors());
var serv = require("http").Server(app);

app.set("statusVars", {
  cpcbJobStatus: false,
  hysplitJobStatus: false,
  modisJobStatus: false,
});

app.set("controlVars", {
  cpcbControl: false,
  hysplitControl: false,
  modisControl: false,
});

//Enable other routes
var apiRouter = require("./routes/api");
app.use("/api", apiRouter);

log4js.configure({
  appenders: {
    access: {
      type: "dateFile",
      filename: "logs/access.log",
      pattern: "-yyyy-MM-dd",
      category: "http",
    },
    app: {
      type: "file",
      filename: "logs/app.log",
      maxLogSize: 10485760,
      numBackups: 3,
    },
    errorFile: {
      type: "file",
      filename: "logs/errors.log",
    },
    errors: {
      type: "logLevelFilter",
      level: "ERROR",
      appender: "errorFile",
    },
    out: {
      type: "stdout",
    },
  },
  categories: {
    default: { appenders: ["app", "errors", "out"], level: "DEBUG" },
    http: { appenders: ["access", "out"], level: "DEBUG" },
  },
});
app.use(
  log4js.connectLogger(log4js.getLogger("http"), {
    level: "auto",
    format: ":method :status HTTP/:http-version :url",
  })
);
const logger = log4js.getLogger("index-logger");

app.use("/public", express.static(__dirname + "/public"));

app.use(express.json());
// app.use(express.urlencoded());

app.get("/", function (req, res, next) {
  res.sendFile(__dirname + "/client/root.html");
});

app.get("/saqi", function (req, res, next) {
  res.sendFile(__dirname + "/client/saqi.html");
});

app.get("/fuseki", function (req, res, next) {
  res.sendFile(
    __dirname + "/RDFstore/apache-jena-fuseki-3.17.0/webapp/index.html"
  );
});

app.set("root", __dirname);

serv.listen(port);

console.log("it's started on http://localhost:" + port);

//Start scraping jobs
// const scheduler = require("./scheduler");
// scheduler.initJobs();

var csvEditor = require("./dals/csveditor");
const processGeoData = require("./services/geonames");

async function main1() {
  //Load CSV
  var [tableCSV, numRows, numCols] = await csvEditor.loadCSV(
    __dirname + "/csvFile.csv"
  );

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

    if (it < numRows - 1) row.push((it + 1).toString());
    else row.push("null");

    it++;
  });

  //Save Changes
  await csvEditor.saveCSV(tableCSV, __dirname + "/csvFileNew.csv");
  await processGeoData.main();
}

const browser = require("./services/browser");
const localdb = require("./dals/localdb")
const scheduler = require("./services/scheduler");
const { test } = require("./services/cpcb");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function waitTests(code){
  console.log("wait test start code: " +code.toString());
  await sleep(2000);
  console.log("wait emd start code: " +code.toString());
  if(code%3===0){
    throw Error("blah");
  }
  return code
}

const eziostat = require("./services/eziostat")

async function main() {
  logger.debug("In main");

  // await eziostat.runScript();
  // await eziostat.combineCSVs();
  

  // await localdb.initializeDB();
  // await localdb.set("k1",[2,124,124,4]);
  // logger.debug(await localdb.get("k1"));

  // await localdb.set("k2",{"jok":[1,2,3],"aa":"bb"});
  // logger.debug(await localdb.get("k2"));

  // scheduler.testSystem();

  // console.log("queue wait Start");
  // testAwaitFns = []
  // for (let i = 0; i < 5; i++) {
  //   testAwaitFns.push(waitTests(i));
  // }
  // results = await Promise.allSettled(testAwaitFns);
  // console.log("queue wait done");
  // console.log(results);
  
  // browser.reloadBrowser();
  // console.log("reloaded");
  // instance = browser.getBrowserInstance();
}
main();
module.exports = app;
