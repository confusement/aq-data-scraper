module.exports = {
  apps : [{
    name        : "scraper-app",
    script      : "./index.js",
    watch       : true,
    env: {
      "NODE_ENV": "development",
    },
    env_production : {
       "NODE_ENV": "production"
    }
  },{
    name       : "triple-store-app",
    script     : "./RDFstore/apache-jena-fuseki-3.17.0/fuseki-server",
    interpreter : "bash"
  }]
}
