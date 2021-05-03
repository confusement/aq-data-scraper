const log4js = require("log4js");
const logger = log4js.getLogger("scheduler");
const cpcb = require("./sources/cpcb");
const hysplit = require("./sources/hysplit");
const schedule = require("node-schedule");
const fs = require("fs");
const util = require("util");
const appendFile = util.promisify(fs.appendFile);

function getHistory(app) {
  console.log(app.get("statusVars"));

  var lol = app.get("statusVars");
  lol.cpcbJobStatus = true;
  app.set("statusVars", lol);
  return app.get("statusVars");
}

module.exports = {
  getHistory: getHistory,
};
