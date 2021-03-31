const port=5001;
// const port=process.env.PORT;
var express =require('express');
var path = require('path');

var log4js = require('log4js');

var app=express();
var serv=require('http').Server(app);


//Enable other routes
var apiRouter = require('./routes/api');
app.use('/api',apiRouter);

log4js.configure({
  "appenders": {
    "access": {
        "type": "dateFile",
        "filename": "logs/access.log",
        "pattern": "-yyyy-MM-dd",
        "category": "http"
    },
    "app": {
        "type": "file",
        "filename": "logs/app.log",
        "maxLogSize": 10485760,
        "numBackups": 3
    },
    "errorFile": {
        "type": "file",
        "filename": "logs/errors.log"
    },
    "errors": {
        "type": "logLevelFilter",
        "level": "ERROR",
        "appender": "errorFile"
    },
    "out": {
        "type": "stdout"
    }
},
"categories": {
    "default": { "appenders": [ "app", "errors", "out" ], "level": "DEBUG" },
    "http": { "appenders": [ "access", "out" ], "level": "DEBUG" }
}
});
app.use(log4js.connectLogger(log4js.getLogger("http"), { level: 'auto', format: ':method :status HTTP/:http-version :url' }));

app.use('/public',express.static(__dirname+'/public'));

app.use(express.json());
// app.use(express.urlencoded());

app.get('/',function(req,res,next){
    res.sendFile(__dirname+'/client/root.html')
});



app.set('root',__dirname);

serv.listen(port);

console.log("it's started on http://localhost:"+port);

module.exports=app;