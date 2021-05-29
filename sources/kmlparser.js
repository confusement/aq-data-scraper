const parseKML = require("parse-kml");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const log4js = require("log4js");
const logger = log4js.getLogger("kml-parser");

async function kmltocsv(inputFile, outputFile) {
  let response = await parseKML.toJson(inputFile);

  const csvWriter = createCsvWriter({
    path: outputFile,
    header: [
      { id: "timestamp", title: "timestamp" },
      { id: "longitude", title: "longitude" },
      { id: "latitude", title: "latitude" },
      { id: "height", title: "height" },
    ],
  });

  try {
    var res = response["features"];
    var finObj = [];
    for (var i = 1; i < res.length; i++) {
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

module.exports = {
  kmltocsv: kmltocsv,
};
