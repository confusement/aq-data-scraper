// const filedb = require("./../dals/filedb");
// const sqlite3 = require("sqlite3");
// const fs = require("fs");
// const open = require("sqlite").open;
// var log4js = require("log4js");
// const logger = log4js.getLogger("filedb-dal");

// async function genRandomFile(path) {
//   let lyrics =
//     "But still I'm having memories of high speeds when the cops crashed\n" +
//     "As I laugh, pushin the gas while my Glocks blast\n" +
//     "We was young and we was dumb but we had heart";
//   fs.writeFile(path, lyrics, (err) => {
//     if (err) throw err;
//     console.log("Lyric saved!");
//   });
// }

// function readAndPrint(filepath) {
//   fs.readFile(filepath, (error, data) => {
//     if (error) {
//       throw error;
//     }
//     console.log(data.toString());
//   });
//   return 2;
// }

// async function test() {
//   //readAndPrint("./AllFiles/rawData/hysplit/usoogi.txt");
//   const db = await filedb.getDBConnection();
//   //await filedb.resetTable(db, "rawData");
//   const createTblRes = await filedb.createTable(db, "rawData");
//   const res = await db.all("select name from sqlite_master where type='table'");
//   console.log(res);
//   //await filedb.resetTable(db, "rawData");
//   const rest = await filedb.getAll(db, "rawData");
//   console.log("Result OF select query " + rest);
//   //   const db = await filedb.getDBConnection();
//   //

//   // for (let i = 0; i < 6; i++) {
//   //   let r = (Math.random() + 1).toString(36).substring(7);
//   //   var fileId = {
//   //     src: "hysplit",
//   //     ext: "txt",
//   //     name: r,
//   //     table: "rawData",
//   //   };
//   //   let fn = await filedb.genFileName(fileId);
//   //   !fs.existsSync(fileId.dir) && fs.mkdirSync(fileId.dir, { recursive: true });
//   //   genRandomFile(fn);
//   //   await filedb.writeToDB(db, fileId);
//   //   const rest = await filedb.getAll(db, "rawData");
//   //   console.log("Result OF select query " + rest);
//   // }
//   await filedb.execNRemove(db, "rawData", "path", readAndPrint);
//   const fff = await filedb.getAll(db, "rawData");
//   console.log("Result OF select query " + fff);
// }

// function tester() {
//   test();
// }

// tester();
