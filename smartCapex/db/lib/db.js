'use strict'

const Mongoose = require('mongoose')
Mongoose.set('useUnifiedTopology', true)

// let mongoose = null
let conn = null
// singleton db
module.exports = async function setupDatabase(config) {
    const {
        dev,
        dbUser,
        dbPassword,
        dbHost,
        dbPort,
        dbName
    } = config
    // if (!mongoose) {
    console.log("tengo config?")
    console.log(config)
        conn = await Mongoose.createConnection(`mongodb://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`, { useNewUrlParser: true, useCreateIndex: true, debug: dev, useFindAndModify: false})
    console.log("consegui conn")

    // linkModel = conn.model('links',linkSchema)
    // routerModel = conn.model('links',routerSchema)

        return conn
       /* mongoose = await Mongoose.connect(`mongodb://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`, { useNewUrlParser: true, useCreateIndex: true })
        mongoose.set('debug', dev)
        mongoose.set('useFindAndModify', false)*/

}