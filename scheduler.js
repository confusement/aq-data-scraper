//TODO
//DEFINE SCHEDULING AND RUN THE TASKS

const log4js = require('log4js');
const logger = log4js.getLogger("scheduler");
const cpcb = require('./sources/cpcb');
const schedule = require('node-schedule');
const fs = require('fs');
const util = require('util');
const appendFile = util.promisify(fs.appendFile);

async function cpcbJob(){
    startTime = Date.now()
    const cpcbConfig = require(__dirname+'/sources/config/cpcb.json')
    try{
        let result = await cpcb.scrape({});
        await appendFile(__dirname+cpcbConfig.schedule.logFile, JSON.stringify(
            {
                result:result,
                jobStart:startTime,
                rdf_files:[]
            }
        ));
    }
    catch(e){
        logger.error(e);
    }

}
async function initJobs(){
    //CPCB
    //============================================================================================
    const cpcbConfig = require(__dirname+'/sources/config/cpcb.json')
    const cpcbRule = new schedule.RecurrenceRule();
    cpcbRule.second = cpcbConfig.schedule.recurrenceRule.second;
    const cpcbJobInstance = schedule.scheduleJob(cpcbRule,cpcbJob);

    //============================================================================================
}
async function getHistory(params){
    return {
        msg:"Success... OK"
    };
}

module.exports = {
    "getHistory":getHistory,
    "initJobs":initJobs,
}