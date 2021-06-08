module.exports = {
  apps: [
    {
      name: "scraper-app",
      script: "./index.js",
      watch: true,
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
      interpreter: "node",
    },
    {
      name: "triple-store-app",
      watch: true,
      script: "./RDFstore/apache-jena-fuseki-3.17.0/fuseki-server",
      interpreter: "bash",
    },
  ],
};
