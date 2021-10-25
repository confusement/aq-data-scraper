let databases = await window.indexedDB.databases()
console.log(databases[0]);
var request = window.indexedDB.open(databases[0].name, databases[0].version);
request.onsuccess = function (){
	let db = request.result;
	let transaction = db.transaction("firebase:authUser:AIzaSyB-1GhnVd8wKjZX8soQ6vVzl_ojPDwmapE:[DEFAULT]", "readonly");
	let objectStore = transaction.objectStore("firebase:authUser:AIzaSyB-1GhnVd8wKjZX8soQ6vVzl_ojPDwmapE:[DEFAULT]");
	console.log(objectStore.getAll());
}