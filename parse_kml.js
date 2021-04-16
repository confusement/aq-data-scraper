const parseKML = require("parse-kml");

parseKML
  .toJson("C:\\Users\\saadf\\Desktop\\HYSPLITtraj_114217_01.kml")
  .then(console.log)
  .catch(console.error);
