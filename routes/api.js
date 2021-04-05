var express = require('express');
var router = express.Router();
const log4js = require('log4js');
const logger = log4js.getLogger("API");
const util = require('util');

const cpcb = require('./../sources/cpcb')
const testSource = require('./../sources/testSource')
const scheduler = require('./../scheduler')

router.get('/mapCSV', async function(req, res, next) {
    switch(req.query.source){
        case 'cpcb':
            let result = await cpcb.mapCSV(req.query);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                result:"Succesfull",
                msg:result.msg
            }));
            break;
        default :
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                result:"ERROR",
                msg:"Source name doesn't match"
            }));
            break;
    }
});
router.get('/scrape', async function(req, res, next) {
    switch(req.query.source){
        case 'cpcb':
            let result = await cpcb.scrape(req.query);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                result:"Succesfull",
                msg:result.msg
            }));
            break;
        case 'test':
            let r = await testSource.test(req.query);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                result:"Succesfull",
                msg:r.msg
            }));
            break;
        default :
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                result:"ERROR",
                msg:"Source name doesn't match"
            }));
            break;
    }
});
router.get('/performance', async function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(
        {
            CPU:[45,32,64,61,62,72,71,63,68,50,40,31,35,32,36],
            RAM:[368,372,468,480,492,512,508,499,467,368,378,361,333,321,351],
            frequency:1,
            msg:"Success... OK"
        }
    ));
});
router.get('/systems', async function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(
        {
            systemList:[
                {
                    name:"cpcb",
                    status:"enabled",
                    isRunning:true,
                    cron:"* * * * *",
                    rdfCache:0,
                    lastRun:1617662546090,
                    description:"cpcb desc",
                },
                {
                    name:"modis",
                    status:"enabled",
                    isRunning:true,
                    cron:"* * * * *",
                    rdfCache:0,
                    lastRun:1617662546090,
                    description:"modis desc",
                },
                {
                    name:"trajectory",
                    status:"enabled",
                    isRunning:true,
                    cron:"* * * * *",
                    rdfCache:0,
                    lastRun:1617662546090,
                    description:"trajectory desc",
                },
            ],
            msg:"Success... OK"
        }
    ));
});
router.get('/systems/:system/enable', async function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(
    {
        result:req.params.system+" is now enabled",
        msg:"Success... OK"
    }));
});
router.get('/systems/:system/disable', async function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(
    {
        result:req.params.system+" is now disabled",
        msg:"Success... OK"
    }));
});
router.get('/systems/:system/clear', async function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(
    {
        result:req.params.system+" files have been cleaned",
        msg:"Success... OK"
    }));
});
router.get('/systems/:system/run', async function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(
    {
        result:req.params.system+" system is scheduled right now",
        msg:"Success... OK"
    }));
});
router.get('/systems/:system', async function(req, res, next) {
    switch(req.params.system){
        case "cpcb":
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(
                {
                    name:"cpcb",
                    status:"enabled",
                    isRunning:true,
                    cron:"* * * * *",
                    rdfCache:0,
                    lastRun:1617662546090,
                    description:"cpcb desc",
                    history:
                        [
                            {
                                jobStart:1617662546090,
                                rdf_files:[
                                    "baseURI/file1.owl",
                                    "baseURI/file2.owl",
                                    "baseURI/file3.owl",
                                    "baseURI/file4.owl"
                                ]
                            },
                            {
                                jobStart:1617662543090,
                                rdf_files:[
                                    "baseURI/file1.owl",
                                    "baseURI/file2.owl",
                                    "baseURI/file3.owl",
                                    "baseURI/file4.owl"
                                ]
                            }
                        ],
                    msg:"Success... OK"
                }
            ));
            break;
        case "modis":
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(
                {
                    name:"modis",
                    status:"enabled",
                    isRunning:true,
                    cron:"* * * * *",
                    rdfCache:0,
                    lastRun:1617662546090,
                    description:"modis desc",
                    history:
                    [
                        {
                            jobStart:1617662546090,
                            rdf_files:[
                                "baseURI/file1.owl",
                                "baseURI/file2.owl",
                                "baseURI/file3.owl",
                                "baseURI/file4.owl"
                            ]
                        },
                        {
                            jobStart:1617662543090,
                            rdf_files:[
                                "baseURI/file1.owl",
                                "baseURI/file2.owl",
                                "baseURI/file3.owl",
                                "baseURI/file4.owl"
                            ]
                        }
                    ],
                    msg:"Success... OK"
                }
            ));
            break;
        case "trajectory":
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(
                {
                    name:"trajectory",
                    status:"enabled",
                    isRunning:true,
                    cron:"* * * * *",
                    rdfCache:0,
                    lastRun:1617662546090,
                    description:"trajectory desc",
                    history:
                    [
                        {
                            jobStart:1617662546090,
                            rdf_files:[
                                "baseURI/file1.owl",
                                "baseURI/file2.owl",
                                "baseURI/file3.owl",
                                "baseURI/file4.owl"
                            ]
                        },
                        {
                            jobStart:1617662543090,
                            rdf_files:[
                                "baseURI/file1.owl",
                                "baseURI/file2.owl",
                                "baseURI/file3.owl",
                                "baseURI/file4.owl"
                            ]
                        }
                    ],
                    msg:"Success... OK"
                }
            ));
            break;
        default:
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(
                {
                    msg:"No System found with name: \""+req.params.system+"\""+"... Failed"
                }
            ));
    }
});
//IDK what to put here rn
router.get('/fuseki', async function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(
        {
            isRunning:true,
            endpoint:"fuseki/endpoint",
            msg:"Success... OK"
        }
    ));
});
module.exports = router;