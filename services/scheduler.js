var log4js = require("log4js");
const logger = log4js.getLogger("scheduler");
const localdb = require("./../dals/localdb");
const util = require("util");
//Load all systems present in config
const systemsInfo = require("../config/systems");
const { start } = require("repl");
const cpcb = require("../services/cpcb");
const hysplit = require("../services/hysplit");
var systems = {};
for (const system of systemsInfo["systems"]) {
  systems[system["source"]] = require("../services/" + system["source"]);
}

async function testSystem() {
  systems["cpcb"].test();
  jobs = await systems["cpcb"].initializeJobs();
  for (j of jobs) {
    await localdb.listAppend("jobs", j);
  }
  // logger.info(util.inspect(await localdb.get("jobs"), showHidden=false, depth=7, colorize=true));
  startJobs();
}

async function handleGetStatus() {
  return await localdb.get("jobs");
}

const browserLoadLimit = 4;
async function startJobs() {
  while (true) {
    logger.info("restart runqueue loop");
    let counter = 0;
    let browserLoad = 0;
    jobs = await localdb.get("jobs");
    runQueue = [];
    // logger.info(util.inspect(jobs, showHidden=false, depth=7, colorize=true));
    for (j of jobs) {
      if (
        j.stages.acquisition.status != "S" &&
        j.stages.acquisition.retriesLeft >= 0
      ) {
        if (browserLoad < browserLoadLimit) {
          runQueue.push(cpcb.acquisition(j.id, j.stages.acquisition.data));
          browserLoad += 1;
        }
      } else if (
        j.stages.preprocess.status != "S" &&
        j.stages.preprocess.retriesLeft >= 0
      ) {
        runQueue.push(cpcb.preprocess(j.id, j.acquisition.data));
      } else if (
        j.stages.mapOntology.status != "S" &&
        j.stages.mapOntology.retriesLeft >= 0
      ) {
        runQueue.push(cpcb.mapOntology(j.id, j.acquisition.data));
      }
    }
    if (counter == 0) break;

    logger.debug(runQueue);
    results = await Promise.allSettled(runQueue);
    logger.debug(results);
  }
}
module.exports = {
  handleGetStatus: handleGetStatus,
  testSystem: testSystem,
};
