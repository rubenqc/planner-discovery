const cron = require('node-cron')
const axios = require('axios')
const  db =  require('../../db')
const moment = require('moment')
const plannerDb = require('planner-db')
const fs = require('fs')
const { saveExcel }  = require('../utils')


const config = {
    dev: 'production',
    dbUser: "palantir",
    dbPassword: "Palantir1234",
    dbHost: "10.30.17.81",
    dbPort: "27017",
    dbName: "palantir"
}

const searchRings = async (site) => {
    const { RouterLink } = await plannerDb(config)
    const result = await RouterLink.findRingsByRouterName(site)
    return result
}

const updateUtilization = async () => {
    const { Link } = await db()
    let _links = await Link.listAllLight()
     _links = _links.slice(-13)
    // console.log(_links)
    console.log('ya filtro')

    for (const link of _links) {
        if(link.instanceName != null){
            const date = moment().subtract(2, 'days').format('YYYY-MM-DD')
            try {
                const { Router, Idu } = await plannerDb(config)
                let max = null
                if(link.gestor === 'U2000-Datacom'){
                    max = await Router.findMaxUtilizationByInstanceAndDate(
                      link.instanceName,
                      new Date(`${date} 00:00`)
                    )
                    console.log("AGREGANDO DESDE router",max)

                }else{
                    max = await Idu.findMaxUtilizationByInstanceAndDate(
                      link.instanceName,
                      new Date(`${date} 00:00`)
                    )
                    console.log("AGREGANDO DESDE iDU",max)
                }
                if(max !== null){
                    await Link.updateUtilization({
                        _id : link._id,
                        value : max,
                        date,
                        capacity : link.capacity,
                        instanceName : link.instanceName,
                        throutput : link.capacity ? (max / 100) * link.capacity : 0
                    })
                }
            }catch (error){
                console.warn(error)
            }
        }
    }
    console.log("FINALIZO EL PROCESO")

}

const getRouterNames = async  () => {
    const urlBase = 'http://186.163.3.23:83/api/ingtx/router'
    const { Router } = await db()

    try {
        const response = await axios.get(urlBase ,{
            headers: {
                'Authorization': process.env.UTILIZATION_TOKEN
            }




        })
        if(response.status === 200) {
            const {data} = response
            for (const router of data) {
                if(router.siteName && router.routerType !== "OTRO"){
                    await Router.addRouterNameOrCreate({
                        routerType : router.routerType,
                        siteName : router.siteName,
                        routerName : router.routerName
                    })
                }
            }
        }
    }catch (error){
        console.warn(error)
    }
}

const reloadLinksReport = async () => {
    const { Link } = await db()
    const links = await Link.listAllWithDetails()
    const result  = {
        date : moment().format('DD-MM-YYYY hh:mm:ss'),
        enlaces : links
    }
    const _json = JSON.stringify(result)
    fs.writeFileSync('/var/www/smart_capex_prod/smartCapex/src/storage/reportLinks/report.json', _json);
}

const reportOracleUtilization = async () => {
    const { Link } = await db()
    const result = await Link.reportUtilizationByOracle()
    const dir = '/var/www/smart_capex_prod/smartCapex/src/storage/reportLinks/'
    const excel = `reporte_RX-TX_MAX_utilization_alldata.xlsx`
    await saveExcel(result,'report',excel,dir)
}

const updateUtilizationCRON = () => {
    cron.schedule("31 11 * * *",updateUtilization)
}

const getRoutersCRON = () => {
    cron.schedule("00 03 * * *",getRouterNames)
}

const reloadLinksReportCRON = () => {
    cron.schedule("00 04 * * *",reloadLinksReport)
}

const reportByOracle = () => {
    cron.schedule("00 05 * * *",reportOracleUtilization)
}

module.exports = {
    updateUtilizationCRON,
    getRoutersCRON,
    reloadLinksReportCRON,
    searchRings,
    reportByOracle,
    reportOracleUtilization,
    config
}
