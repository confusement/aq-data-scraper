const log4js = require("log4js");
const logger = log4js.getLogger("scheduler");
const fs = require("fs");
const util = require("util");
const appendFile = util.promisify(fs.appendFile);

// function getHistory(app) {
//   console.log(app.get("statusVars"));

//   var lol = app.get("statusVars");
//   lol.cpcbJobStatus = true;
//   app.set("statusVars", lol);
//   return app.get("statusVars");
//      /^\[\d\d\d\d-(0?[1-9]|1[0-2])-(0?[1-9]|[12][0-9]|3[01])\T(00|[0-9]|1[0-9]|2[0-3]):([0-9]|[0-5][0-9]):([0-9]|[0-5][0-9])\.([0-9]+)\] \[\w+\]$/g
// }

// module.exports = {
//   getHistory: getHistory,
// };

var file = fs.readFile("logs\\cpcb-scraper.log", "utf8", function (err, doc) {
  var comments = doc.match(
    /\[\d\d\d\d-(0?[1-9]|1[0-2])-(0?[1-9]|[12][0-9]|3[01])\T(00|[0-9]|1[0-9]|2[0-3]):([0-9]|[0-5][0-9]):([0-9]|[0-5][0-9])\.([0-9]+)\] \[\w+\]/g
  );
  var stat = comments[comments.length - 1];
  var time_mode = stat.match(/\[(.*?)\]/g);
  var lastRan = time_mode[0].substring(1, time_mode[0].length - 1);
  var lastmode = time_mode[1].substring(1, time_mode[1].length - 1);

  console.log(lastRan);
  console.log(lastmode);
});
