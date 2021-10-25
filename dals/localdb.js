const JSONdb = require('simple-json-db');
var log4js = require("log4js");
const logger = log4js.getLogger("localdb-dal");
var AsyncLock = require('async-lock');
var lock = new AsyncLock({timeout: 5000});
const fs = require("fs").promises;

const db = new JSONdb(__dirname + "./../db/db.json",{
    asyncWrite : false,
    syncOnWrite : true,
    jsonSpaces : 4
});

async function initializeDB(){
    lock.acquire("db", function() {
        db.set('systems', {
            "cbcb":{
                history:[]
            }
        });
        db.set('jobs', []);
        db.set('jobCounter',0);
    }).catch(function(err) {
        logger.error(err.message) // output: error
    });

    logger.info("Local DB initialized")
}
async function get(key){

    object = lock.acquire("db", function() {
        return db.get(key);
    }).catch(function(err) {
        logger.error(err.message) // output: error
    });
    return object;
}
async function set(key,value){

    lock.acquire("db", function() {
        db.set(key,value);
    }).catch(function(err) {
        logger.error(err.message) // output: error
    });
}
//Key should be a list or error will be thrown
async function listAppend(key,element){
    lock.acquire("db", function() {
        arr = db.get(key)
        arr.push(element)
        db.set(key,arr);
    }).catch(function(err) {
        logger.error(err.message) // output: error
    });
}

async function generateID(){
    let id = lock.acquire("db", function() {
        let id = db.get("jobCounter")
        let newID = id+1;
        db.set("jobCounter",newID);
        return id;
    }).catch(function(err) {
        logger.error(err.message) // output: error
    });
    return id;
}

async function savetoFile(data,filepath){
  try{
    await fs.writeFile(
      filepath,
      data
    );
  }
  catch(err){
    logger.error(err.message)
  }
}

async function updateStageInfo(id,stage,status,nextStageData){
    lock.acquire("db", function() {
      arr = db.get("jobs")
      let job = arr.find(j => j.id === id);
      if (job !== 'undefined'){
        if(status=="F"){
          job.stages[stage].retriesLeft -= 1;
          if(job.stages[stage].retriesLeft==0){
            job.stages[stage].status = "C";
          }
          else{
            job.stages[stage].status = "F";
          }
        }
        else if((status=="S")){
          job.stages[stage].status = "S";
          if(stage=="acquisition"){
            job.stages["preprocess"].data = nextStageData;
          }
          else if(stage=="preprocess"){
            job.stages["mapOntology"].data = nextStageData;
          }
          db.sync();
        }
      }
      else{
        logger.info("Update called for job not in the list, jobID: " +id.toString());
      }
    }).catch(function(err) {
        logger.error(err.message) // output: error
    });
}

module.exports = {
    "initializeDB": initializeDB,
    "get": get,
    "set": set, 
    "listAppend":listAppend,
    "generateID":generateID,
    "savetoFile":savetoFile,
    "updateStageInfo":updateStageInfo
};