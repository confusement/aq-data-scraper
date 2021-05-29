const extract = require("extract-zip");
const fs = require("fs");
const path = require("path");

var dir_name = "C:/Users/saadf/Desktop/kmtokmlTest"; // Take input from hysplit.js
var directory = dir_name + "/ext";
async function main() {
  try {
    await extract("C:/Users/saadf/Desktop/kmtokmlTest/sriAurobindoMarg.kmz", {
      // Take input from hysplit.js
      dir: dir_name + "/ext",
    });
    console.log("Extraction complete");

    fs.readdir(directory, (err, files) => {
      if (err) throw err;

      for (const file of files) {
        if (
          path.join(directory, file).includes(".png") ||
          path.join(directory, file).includes(".gif")
        ) {
          console.log(path.join(directory, file));
          fs.unlink(path.join(directory, file), (err) => {
            if (err) throw err;
          });
        } else if (path.join(directory, file).includes(".kml")) {
          fs.rename(file, "world.kml", () => {
            console.log("\nFile Renamed!\n");
          });
        }
      }
    });
  } catch (err) {
    console.log(err);
  }
}

main();
