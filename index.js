const port = 5001;
// const port=process.env.PORT;
var express = require("express");
var path = require("path");
var log4js = require("log4js");
const tester = require("./test");
var app = express();
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

app.use("/public", express.static(__dirname + "/public"));

app.use(express.json());
// app.use(express.urlencoded());

app.get("/", function (req, res, next) {
  res.sendFile(__dirname + "/client/root.html");
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

var csvEditor = require("./scripts/csvEditor");
const processGeoData = require("./scripts/processGeoData");

async function main(){

  //Load CSV
  var [tableCSV,numRows,numCols] = await csvEditor.loadCSV(__dirname+"/csvFile.csv")

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

    if(it<numRows-1)
      row.push((it+1).toString())
    else
      row.push("null")
      
    it++;
  });

  //Save Changes
  await csvEditor.saveCSV(tableCSV,__dirname+"/csvFileNew.csv")
  await processGeoData.main();

}

// main();
module.exports = app;
