//TODO
//DEFINE SCHEDULING AND RUN THE TASKS

const log4js = require("log4js");
const logger = log4js.getLogger("scheduler");
const cpcb = require("./sources/cpcb");
const hysplit = require("./sources/hysplit");
const schedule = require("node-schedule");
const fs = require("fs");
const util = require("util");
const appendFile = util.promisify(fs.appendFile);

var debugStop = false;

var cpcbJobInstance;
var hysplitJobInstance;
var modisJobInstance;

async function cpcbJob() {
  if (debugStop) return;
  startTime = Date.now();
  logger.debug("Started CPCB Job at ", new Date().toISOString());
  cpcbConfig = require(__dirname + "/sources/config/cpcb.json");
  try {
    debugStop = true;
    let scraperesult = await cpcb.scrape({});
    // scraperesult={msg:"Debug Skipped Scrape"}
    let mapResult = await cpcb.mapCSV();
    await appendFile(
      __dirname + cpcbConfig.schedule.logFile,
      JSON.stringify({
        scraperesult: scraperesult,
        mapResult,
        mapResult,
        jobStart: startTime,
      }) + "\n"
    );
    logger.debug("CPCB Job Ended");
  } catch (e) {
    logger.error(e);
  }
}

async function hysplitJob() {
  if (debugStop) return;
  startTime = Date.now();
  logger.debug("Started HYSPLIT Job at ", new Date().toISOString());
  hysplitConfig = require(__dirname + "/sources/config/hysplit.json");
  try {
    debugStop = true;
    let scraperesult = await hysplit.scrape({});
    // scraperesult={msg:"Debug Skipped Scrape"}
    let mapResult = await hysplit.mapCSV();
    await appendFile(
      __dirname + hysplitConfig.schedule.logFile,
      JSON.stringify({
        scraperesult: scraperesult,
        mapResult,
        mapResult,
        jobStart: startTime,
      }) + "\n"
    );
    logger.debug("HYSPLIT Job Ended");
  } catch (e) {
    logger.error(e);
  }
}

async function initJobs(system) {
  switch (system) {
    case "cpcb":
      const cpcbConfig = require(__dirname + "/sources/config/cpcb.json");
      const cpcbRule = new schedule.RecurrenceRule();
      cpcbRule.second = cpcbConfig.schedule.recurrenceRule.second;
      cpcbJobInstance = schedule.scheduleJob(cpcbRule, cpcbJob);
      break;
    case "hysplit":
      const hysplitConfig = require(__dirname + "/sources/config/hysplit.json");
      const hysplitRule = new schedule.RecurrenceRule();
      hysplitRule.second = hysplitConfig.schedule.recurrenceRule.second;
      hysplitJobInstance = schedule.scheduleJob(hysplitRule, hysplitJob);
      break;
    case "modis":
      const hysplitConfig = require(__dirname + "/sources/config/hysplit.json");
      const hysplitRule = new schedule.RecurrenceRule();
      hysplitRule.second = hysplitConfig.schedule.recurrenceRule.second;
      hysplitJobInstance = schedule.scheduleJob(hysplitRule, hysplitJob);
      break;
    default:
      const cpcbConfig = require(__dirname + "/sources/config/cpcb.json");
      const cpcbRule = new schedule.RecurrenceRule();
      cpcbRule.second = cpcbConfig.schedule.recurrenceRule.second;
      cpcbJobInstance = schedule.scheduleJob(cpcbRule, cpcbJob);

      const hysplitConfig = require(__dirname + "/sources/config/hysplit.json");
      const hysplitRule = new schedule.RecurrenceRule();
      hysplitRule.second = hysplitConfig.schedule.recurrenceRule.second;
      hysplitJobInstance = schedule.scheduleJob(hysplitRule, hysplitJob);

      break;
  }
}

async function stopJobs(system) {
  /**
   * system is an optional argument
   * If no argument is passed, all jobs are cancelled
   *
   * An exception may be thrown if the Jobs havent been initialized
   */
  try {
    switch (system) {
      case "cpcb":
        cpcbJobInstance.cancel();
        break;
      case "hysplit":
        hysplitJobInstance.cancel();
        break;
      case "modis":
        modisJobInstance.cancel();
        break;
      default:
        cpcbJobInstance.cancel();
        hysplitJobInstance.cancel();
        modisJobInstance.cancel();
        break;
    }
  } catch (e) {
    logger.error(e);
  }
}

async function getStatus(app) {
  /**
   * If nextInvocation is null => job is no longer running
   *
   * Else set the nextInvocation() response to the status variable
   *    for a particular system.
   */

  //CPCB
  try {
    if (cpcbJobInstance.nextInvocation() == null) {
      var statusvars = app.get("statusVars");
      statusvars.cpcbJobStatus = false;
      app.set("statusVars", statusvars);
    } else {
      var statusvars = app.get("statusVars");
      statusvars.cpcbJobStatus = true;
      app.set("statusVars", statusvars);
    }
  } catch (e) {
    logger.error(e);
  }

  //HYSPLIT
  try {
    if (hysplitJobInstance.nextInvocation() == null) {
      var statusvars = app.get("statusVars");
      statusvars.hysplitJobStatus = false;
      app.set("statusVars", statusvars);
    } else {
      var statusvars = app.get("statusVars");
      statusvars.hysplitJobStatus = true;
      app.set("statusVars", statusvars);
    }
  } catch (e) {
    logger.error(e);
  }

  //MODIS
  try {
    if (modisJobInstance.nextInvocation() == null) {
      var statusvars = app.get("statusVars");
      statusvars.modisJobStatus = false;
      app.set("statusVars", statusvars);
    } else {
      var statusvars = app.get("statusVars");
      statusvars.modisJobStatus = true;
      app.set("statusVars", statusvars);
    }
  } catch (e) {
    logger.error(e);
  }
}

async function getHistory(params) {
  return {
    msg: "Success... OK",
  };
}

module.exports = {
  getHistory: getHistory,
  initJobs: initJobs,
  getStatus: getStatus,
  stopJobs: stopJobs,
};
