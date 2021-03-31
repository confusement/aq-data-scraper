var express = require('express');
var router = express.Router();
const log4js = require('log4js');
const logger = log4js.getLogger("API");
const util = require('util');

const cpcb = require('./../sources/cpcb')

const puppeteer = require('puppeteer');
var browser = null;
async function reloadBrowser(){
    if(!browser)
        browser = await puppeteer.launch({
            headless: false ,
            executablePath: '/usr/bin/chromium',
            // args: ['--start-maximized']
        });
}
router.get('/mapCSV', async function(req, res, next) {
    switch(req.query.source){
        case 'cpcb':
            cpcb.setBrowserInstance(browser);
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
    await reloadBrowser();
    switch(req.query.source){
        case 'cpcb':
            cpcb.setBrowserInstance(browser);
            let result = await cpcb.scrape(req.query);
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
module.exports = router;