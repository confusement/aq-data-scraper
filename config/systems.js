module.exports = {
    "systems":[
        {
            source:"cpcb",
            "schedule": {
                "recurrenceRule": {
                  "minute": null,
                  "second": 30,
                  "hour": null,
                  "date": null,
                  "month": null
                },
                "logFile": "/logs/cpcb.log"
            },
            "config": {
                "locations": [
                    {
                      "url": "https://app.cpcbccr.com/ccr/#/caaqm-dashboard-all/caaqm-landing/data/%7B%22state%22:%22Delhi%22,%22city%22:%22Delhi%22,%22station%22:%22site_1428%22%7D",
                      "State": "Delhi",
                      "City": "Delhi",
                      "StationName": "Okhla Phase-2, Delhi - DPCC   "
                    }
                  ]
            }
        },
        {
            source:"hysplit",
            "schedule": {
                "recurrenceRule": {
                  "minute": null,
                  "second": 5,
                  "hour": null,
                  "date": null,
                  "month": null
                },
                "logFile": "/logs/hysplit.log"
            },
            "config": {
                "locations": [
                    {
                      "StationName": "ITO, Delhi - CPCB",
                      "latitude": "28.628624",
                      "longitude": "77.241060",
                      "IRI": "ITO"
                    }
                ]
            }
        }
    ]
}