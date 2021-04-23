# aq-data-scraper
### Dependencies
- nodejs 10x or above
- chromium browser installed, specify executable path if different from default in api.js
- yarrml-parser installed globally, i.e. added to PATH , `sudo npm i @rmlio/yarrrml-parser -g`
### Instruction
- Clone repository : `git clone https://github.com/confusement/aq-data-scraper`
- Install Packages : `npm install`
- Use pm2 to manage api server, client server and rdf triple store (apache jena fuseki)
- `pm2 start` to start all servers or use `pm2 start 0/1/2` to start scraper-app, fuseki and UI frontend server
- `pm2 logs 0/1/2` for viewing stdout of corresponding server
- `pm2 stop all` to stop all servers
- `watch pm2 status` to monitor cpu and ram usage from all the servers
### Clint API
- Use postman collection in /docs to quickly test api
