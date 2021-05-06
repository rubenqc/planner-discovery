const express = require('express')
const debug = require('debug')('app:v1')
require("dotenv").config()
const _ = require('lodash')
const routes = require('./src/routes')
const bodyParser = require('body-parser')
const cors = require('cors')
const { updateUtilizationCRON, getRoutersCRON, reloadLinksReportCRON,reportOracleUtilization } = require('./src/jobs')
const path = require('path')


//INICIANDO CRON
/*updateUtilizationCRON()
getRoutersCRON()
reloadLinksReportCRON()
reportOracleUtilization()*/

//GET ENV
const port = process.env.PORT || 2500

//INSTANCE EXPRESS
const app = express()

//SET CORS
app.use(cors())

//SER BODY PARSER
app.use(bodyParser.json())
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }))

const STATIC = path.resolve(__dirname, 'smartcapex');
const INDEX = path.resolve(STATIC, 'index.html');

// SET ROUTES
app.use('/smartcapex/api/v1', routes)

// Static content
app.use(express.static(STATIC));
app.get('/smartcapex', function (req, res) {
    res.sendFile(INDEX);
});

// ERROR HANDLER
app.use((req, res, next) => {
    const err = new Error('Not Found')
    err.status = 404
    next(err)
})

app.use((err, req, res) => {
    debug(err)
    if (err.message[0] === '{') {
        const error = JSON.parse(err.message)
        const { status } = error
        _.unset(error, 'status')
        res.status(status).json(error)
    } else {
        res.status(err.status || 500).json({ err, msg: err.msg })
    }
})

//RUN SERVER
const run =  () => {
    try {
        app.set('port', port)
        app.listen(app.get('port'), () => {
            debug(`Server listening on port ${app.get('port')}`)
        }).setTimeout(180000000)
    } catch (e) {
        console.log(e);
        debug(`Error: ${e}`)
    }
}

run()
