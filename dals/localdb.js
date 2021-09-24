const JSONdb = require("simple-json-db");
var log4js = require("log4js");
const logger = log4js.getLogger("localdb-dal");
var AsyncLock = require("async-lock");
var lock = new AsyncLock({ timeout: 5000 });

const db = new JSONdb(__dirname + "./../db/db.json", {
  asyncWrite: false,
  syncOnWrite: true,
  jsonSpaces: 4,
});

async function initializeDB() {
  lock
    .acquire("db", function () {
      db.set("systems", {
        cbcb: {
          history: [],
        },
      });
      db.set("jobs", []);
      db.set("jobCounter", 0);
    })
    .catch(function (err) {
      logger.error(err.message); // output: error
    });

  logger.info("Local DB initialized");
}
async function get(key) {
  object = lock
    .acquire("db", function () {
      return db.get(key);
    })
    .catch(function (err) {
      logger.error(err.message); // output: error
    });
  return object;
}
async function set(key, value) {
  lock
    .acquire("db", function () {
      db.set(key, value);
    })
    .catch(function (err) {
      logger.error(err.message); // output: error
    });
}
//Key should be a list or error will be thrown
async function listAppend(key, element) {
  lock
    .acquire("db", function () {
      arr = db.get(key);
      arr.push(element);
      db.set(key, arr);
    })
    .catch(function (err) {
      logger.error(err.message); // output: error
    });
}

async function generateID() {
  let id = lock
    .acquire("db", function () {
      let id = db.get("jobCounter");
      let newID = id + 1;
      db.set("jobCounter", newID);
      return id;
    })
    .catch(function (err) {
      logger.error(err.message); // output: error
    });
  return id;
}

async function completeJob(jobID) {
  lock
    .acquire("db", function () {
      arr = db.get("jobs");
      let job = arr.find((j) => j.ID === jobID);
    })
    .catch(function (err) {
      logger.error(err.message); // output: error
    });
}

module.exports = {
  initializeDB: initializeDB,
  get: get,
  set: set,
  listAppend: listAppend,
  completeJob: completeJob,
  generateID: generateID,
};
