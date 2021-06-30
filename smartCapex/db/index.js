'use strict'
const configDb = {
    dev : process.env.DEV || true,
    dbUser : process.env.DBUSER,
    dbPassword : process.env.DBPASSWORD,
    dbHost : process.env.DBHOST,
    dbPort : process.env.DBPORT,
    dbName : process.env.DBNAME
}
const debug = require('debug')('planner:db:index')
const getConfig = require('./config')

/** Methods */
const { setupDatabase, setupLinks, setupRouters } = require('./lib')

/** Models */
let { linkSchema, routerSchema } = require('./models')

module.exports = async function(config = configDb) {
    let count = 0 ;

    //verificar si es proceso general
    for (const configKey in config) {
        if(configKey !== 'dev' && !config[configKey]){
          count++;
        }
    }

    if(count > 0){
        config = getConfig()
    }

    /** Connect Mongo */

    let conn = await setupDatabase(config)
    if(conn){
        console.log("existo correctamente")
    }
    const linkModel = conn.model('links',linkSchema)
    const routerModel = conn.model('routers',routerSchema)

    /** Create services DB */
    const Link = await setupLinks(linkModel, routerModel)
    const Router = await setupRouters(routerModel, linkModel)

    return {
        Link,
        Router,
        setupDatabase
    }
}
