const fs = require('fs')
const dotenv = require('dotenv')
const path = require('path')

module.exports = function getConfig(){
    const envConfig = dotenv.parse(fs.readFileSync(path.join(__dirname,'../.env')))
    let config = {
        dev : envConfig["DEV"],
        dbUser : envConfig["DBUSER"],
        dbPassword : envConfig["DBPASSWORD"],
        dbHost : envConfig["DBHOST"],
        dbPort : envConfig["DBPORT"],
        dbName : envConfig["DBNAME"],
    };
    return config
}