const {validationResult} =  require("express-validator");
const  db =  require('../../db')
const debug = require('debug')('app:v1:link-controller')
const { asyncHandler, saveExcel }  = require('../utils')
const fs = require('fs')
const _ = require('lodash')
const moment = require('moment')
const xl = require('excel4node');
const { MailService } = require('../services')
const XLSX = require('xlsx')
const axios = require('axios')

// const { searchRings } = require('../jobs')

//obteniendo enlances por un query : collecion paginada
const listByQuery = asyncHandler(async (req, res, next) => {
    debug("get /links/list");
    const { Link } = await db()
    const { pagination, fields  }  = req.body

    let  query  = {}
    //creando query para el filtro por default {}
    for (const key in fields) {
        if (fields.hasOwnProperty(key)) {
            if (key === 'sourceSite') {
                fields[key] !== null && fields[key] !== '' ? query['nearEnd.name'] = {
                    $regex: `.*${fields[key]}.*`,
                    $options: 'i'
                } : null
            } else if (key === 'sinkSite') {
                fields[key] !== null && fields[key] !== '' ? query['farEnd.name'] = {
                    $regex: `.*${fields[key]}.*`,
                    $options: 'i'
                } : null
            } else if (key === 'instanceName') {
                fields[key] !== null && fields[key] !== '' ? query[key] = {
                    $regex: `.*${fields[key]}.*`,
                    $options: 'i'
                } : null
            } else if (key === 'status' || key === 'media' || key === 'priority') {
                fields[key] !== null && fields[key] !== '' && fields[key] !== 'Todos' ? query[key] = fields[key] : null
            } else if (fields[key]) {
                fields[key] !== null && fields[key] !== '' ? query[key] = {
                    $regex: `.*${fields[key]}.*`,
                    $options: 'i'
                } : null
            }
        }
    }
    _.set(query,'documentState',true)
    const links = await Link.listByQuery(pagination,query)
    res.status(200).json(links);
});

const processExcelToJson = asyncHandler(async (req,res) => {
    const { Link } = await db()
    const worksheet = XLSX.readFile(req.file.path, { type: 'base64'})

    const enlaces = XLSX.utils.sheet_to_json(worksheet.Sheets['dataFinalPorEnlaces_07-06-2020_'])
    const enlaces2 = XLSX.utils.sheet_to_json(worksheet.Sheets['Instancias FO IDU A-IDU B'])
    const enlaces3 = XLSX.utils.sheet_to_json(worksheet.Sheets['Instancias FO IDU A - PAG B'])
    const enlaces4 = XLSX.utils.sheet_to_json(worksheet.Sheets['Instancias FO PAG'])
    const enlaces5 = XLSX.utils.sheet_to_json(worksheet.Sheets['Nuevos Enlace MW'])

    for(const enlace of enlaces){
        let obj = {
            validationDate : enlace["Fecha validado"],
            action : enlace["Acción"],
            project : enlace["Proyecto"],
            item : enlace.Item,
            link : enlace.Enlace,
            instanceName : enlace["Instancia Final"],
            distributionType : enlace["Rural / urbano"],
            media : enlace.Medio.trim(),
            mediaType : enlace["Tipo de Enlace"],
            departmentCode : enlace.Departamento,
            nearEnd : {
                code: enlace.NE.split("_")[0],
                name: enlace.NE,
                port : enlace.puertoSourceEnlace,
                location: {
                    type: "Point",
                    coordinates: [enlace.Latitud_NE,enlace.Longitud_NE]
                }
            },
            farEnd : {
                code: enlace.FE.split("_")[0],
                name: enlace.FE,
                port : enlace.puertoSinkEnlace,
                location: {
                    type: "Point",
                    coordinates: [enlace.Latitud_FE,enlace.Longitud_FE]
                }
            },
            distance : enlace.distancia_km.toString(),
            capacity : enlace.capacidad,
            configurationMain : enlace.configuracion,
            diversity : enlace.diversidad,
            modulation : enlace.modulacion,
            bandWidth : enlace.anchoBanda,
            bandFrequency : enlace.Frecuencia,
            gestor: enlace.Gestor
        }
        await Link.findByInstanceAndUpdateOrCreate(obj)
    }

    for(const enlace of enlaces2){
        let obj = {
            link :enlace.NE.concat("_",enlace.FE) ,
            instanceName : enlace.Instancia,
            distributionType : enlace["Rural / urbano"],
            media : enlace.Medio,
            mediaType: enlace["Tipo de Enlace"],
            departmentCode : enlace.Departamento,
            nearEnd : {
                code: enlace.NE.split("_")[0],
                name: enlace.NE,
                location: {
                    type: "Point",
                    coordinates: [enlace["Latitud NE"],enlace["Longitud NE"]]
                }
            },
            farEnd : {
                code: enlace.FE.split("_")[0],
                name: enlace.FE,
                location: {
                    type: "Point",
                    coordinates: [enlace["Latitud  FE"],enlace["Longitud FE"]]
                }
            },
            distance : calcDistanceBetweenCoords([enlace["Latitud NE"],enlace["Longitud NE"]],[enlace["Latitud  FE"],enlace["Longitud FE"]]),
            capacity : 1000,
            validationDate : enlace["Validado"],
            project : enlace["Proyecto"],
            gestor: enlace.Gestor
        }
        await Link.findByInstanceAndUpdateOrCreate(obj)
    }

    for(const enlace of enlaces3){
        let obj = {
            link :enlace.NE.concat("_",enlace.FE),
            instanceName : enlace["Resorce Name"],
            distributionType : enlace["Rural / urbano"],
            media : enlace.MEDIO,
            mediaType: enlace["Tipo de Enlace"],
            departmentCode : enlace.NE.split("_")[1],
            nearEnd : {
                code: enlace.NE.split("_")[0],
                name: enlace.NE,
                location: {
                    type: "Point",
                    coordinates: [enlace["Latitud NE"],enlace["Longitud NE"]]
                }
            },
            farEnd : {
                code: enlace.FE.split("_")[0],
                name: enlace.FE,
                location: {
                    type: "Point",
                    coordinates: [enlace["Latitud  FE"],enlace["Longitud FE"]]
                }
            },
            distance : calcDistanceBetweenCoords([enlace["Latitud NE"],enlace["Longitud NE"]],[enlace["Latitud  FE"],enlace["Longitud FE"]]),
            capacity : 1000,
        }
        await Link.findByInstanceAndUpdateOrCreate(obj)
    }

    for(const enlace of enlaces4){
        let obj = {
            link :enlace.NE.concat("_",enlace.FE),
            instanceName : enlace.Instancia,
            media : enlace.Medio,
            mediaType : enlace["Tipo de Enlace"],
            departmentCode : enlace.NE.split("_")[1],
            nearEnd : {
                code: enlace.NE.split("_")[0],
                name: enlace.NE,
                location : {
                    type :'Point',
                    coordinates: [
                        enlace["Latitud NE"] ? enlace["Latitud NE"] : 0,
                        enlace["Longitud NE"] ? enlace["Longitud NE"] : 0
                    ]
                }
            },
            farEnd : {
                code: enlace.FE.split("_")[0],
                name: enlace.FE,
                location : {
                    type :'Point',
                    coordinates: [enlace["Latitud  FE"],enlace["Longitud FE"]]
                }
            },
            capacity : enlace.Capacidad,
            gestor : enlace.Gestor,
            agg : enlace.AGG,
            anillo : enlace.Anillo,
            cola : enlace.Cola,
            zona : enlace.Zona
        }
        await Link.findByInstanceAndUpdateOrCreate(obj)
    }

    for(const enlace of enlaces5){
        let obj = {
            validationDate : enlace["Fecha validado"],
            action : enlace["Acción"],
            project : enlace["Proyecto"],
            item : enlace.Item,
            link : enlace.Enlace,
            instanceName : enlace["Instancia Final"],
            distributionType : enlace["Rural / urbano"],
            media : enlace["BH / LH / FO / RENTADO-FO"].trim(),
            departmentCode : enlace.Departamento,
            nearEnd : {
                code: enlace.NE.split("_")[0],
                name: enlace.NE,
                location: {
                    type: "Point",
                    coordinates: [enlace.Latitud_NE,enlace.Longitud_NE]
                }
            },
            farEnd : {
                code: enlace.FE.split("_")[0],
                name: enlace.FE,
                port : enlace.puertoSinkEnlace,
                location: {
                    type: "Point",
                    coordinates: [enlace.Latitud_FE,enlace.Longitud_FE]
                }
            },
            distance : enlace.distancia_km.toString(),
            capacity : enlace.capacidad,
            configurationMain : enlace.configuracion,
            diversity : enlace.diversidad,
            modulation : enlace.modulacion,
            bandWidth : enlace.anchoBanda,
            bandFrequency : enlace.Frecuencia,
            gestor: enlace.Gestor
        }
        await Link.findByInstanceAndUpdateOrCreate(obj)
    }

    await fs.unlink(req.file.path, (err) => {
        if (err) {
            console.error(err)
            res.send('error eliminado archivo')
        }
        res.status(200).json({status : 'ok'})
    })
})

//creando Link
const createLink = asyncHandler(async (req,res) => {
    debug("get /links/createLink");
    const { Link } = await db()
    const { enlace } = req.body
    const link = await Link.create(enlace)
    res.status(200).json(link)
})

//editando Link
const updateLink = asyncHandler(async (req,res) => {
    debug("get /links/editLink");
    const { Link } = await db()
    const { enlace } = req.body
    const { _id } = req.params
    const link = await Link.update(enlace,_id)
    res.status(200).json(link)
})

//cambiando DocumentState a 0
const deleteLink = asyncHandler(async (req,res) => {
    debug("get /links/editLink");
    const { Link } = await db()
    const { _id } = req.params
    const link = await Link.deleteLink(_id)
    res.status(200).json(link)
})

//obteniendo topolgia segun site
const getTopology = asyncHandler(async function (req, res, next) {
    const { Link } = await db()
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
    }
    let topology = null
    try {
        console.log(req.query)
        topology = await Link.generateSitesTopologyBySinkSite(req.query.sinkSite, [], [], req.query.hops)
        res.json(topology)
    } catch (e) {
        next(e)
    }
})

//haciendo merge de enlaces
const mergeLinks = asyncHandler(async (req, res) =>{
    const { links } = req.body
    const { Link } = await db()
    const linksForNotification = []
    for (const link of links) {
        if(link.datafill.route) {
            const length = link.datafill.route.length
            let index = 0
            for(const data of link.datafill.route){
                let objLink = {}
                if(index < length - 1) {
                    try {
                        const neData = data.siteName.split("_")
                        const feData = link.datafill.route[index + 1]

                        _.set(objLink, 'validationDate', link.validatedDate)
                        _.set(objLink, 'project', link.project)
                        _.set(objLink, 'link', `${data.siteName}_${link.datafill.route[index + 1].siteName}`)
                        _.set(objLink, 'departmentCode', neData[1])
                        _.set(objLink, 'nearEnd.code', neData[0])
                        _.set(objLink, 'nearEnd.name', data.siteName)
                        _.set(objLink, 'nearEnd.port', data.iduPorts)
                        _.set(objLink, 'farEnd.code', feData.siteName.split("_")[0])
                        _.set(objLink, 'farEnd.name', feData.siteName)
                        _.set(objLink, 'farEnd.port', feData.iduPorts)

                        const _link = await Link.findBySites({ne : objLink.nearEnd.name, fe : objLink.farEnd.name})
                        if(_link){
                            await Link.update(objLink,_link._id)
                        }else{
                            await Link.createFromMerge(objLink)
                        }
                        linksForNotification.push(convertToDotNotation(objLink))
                    }catch (e) {
                        console.log(e)
                    }
                }
                index++
            }
        }
    }
    const pathfile = await Json2Excel(linksForNotification)
    await MailService.sendMail({to : "ga_ortiz@outlook.es", path : pathfile})
    res.status(200).json({result : "ok"})
})

const getInstancesByString = asyncHandler(async (req,res) => {
   const { str } = req.params
   const { Link } = await db()
   const instances  = await Link.getInstancesByString(str)
   res.status(200).json(instances)
})

const getRouterList = asyncHandler(async (req,res) => {
   const { Link } = await db()
   const routers  = await Link.getRoutersList()
   res.status(200).json(routers)
})

const getMaxUtilizationByYear = asyncHandler(async (req,res) => {
    const {_id,year} = req.params
    const { Link } = await db()
    const link = await Link.getLinkById(_id)
    const historyFilteredByYear = link.utilizationHistory.filter(log => moment(log.date).year() == year)
    let result = {
        utilization : [], // Esto será un array con los throutput maximas por mes [n1,n2,...,n12]
        capacity : [] // Esto será un array con los capacity por mes [n1,n2,...,n12]
    }
    for (let i = 0; i <= 11; i++){
        const _result = getMaxUtilizationByMonth(historyFilteredByYear,i)
        result.utilization.push(_result.utilization)
        result.capacity.push(_result.capacity)
    }
    res.status(200).json(result)
})

const getMaxThroutputByYear = asyncHandler(async (req,res) => {
    const {_id,year} = req.params
    const { Link } = await db()
    const link = await Link.getLinkById(_id)
    const historyFilteredByYear = link.utilizationHistory.filter(log => moment(log.date).year() == year)

    let result = {
        throutput : [], // Esto será un array con los throutput maximas por mes [n1,n2,...,n12]
        capacity : [] // Esto será un array con los capacity por mes [n1,n2,...,n12]
    }
    for (let i = 0; i <= 11; i++){
        const _result = getMaxThroutputByMonth(historyFilteredByYear,i)
        result.throutput.push( _result.throutput === 0 ? NaN : _result.throutput)
        result.capacity.push(_result.capacity === 0 ? NaN : _result.capacity)
    }
    res.status(200).json(result)
})

const getTotalTopology = asyncHandler(async (req,res) => {
    const { Link } = await db()
    const result = await Link.generateTopology()
    res.status(200).json(result)
})

const getTotalTopologyBySite = asyncHandler(async (req,res) => {
    const { Link } = await db()
    const { site, routers } = req.query
    const _routers = routers ? true : false
    console.log("############ sites and routes ##########")
    console.log(site,routers)
    const result = await Link.topologySourceAndSinkBySite(site,_routers)
    result.nodes = await setRouters(result.nodes)
    res.status(200).json(result)
})

const registrarXY = asyncHandler(async (req,res) => {
    const { Link } = await db()
    const result = await Link.registrarXY()
    res.status(200).json(result)
})

const updateSitePositions = asyncHandler(async (req,res) =>{
    const { Link } = await db()
    const { nodes } = req.body
    const result = await Link.updateSitePositions(nodes)
    res.status(200).json(result)
})

const getDependencies = asyncHandler( async (req,res) =>{
    const { Link } = await db()
    const {site, nodes, edges, type } = req.body
    const { routers } = req.query
    const _routers = routers ? true : false
    const result = await Link.getDependencies(site,nodes,edges,_routers)
    result.nodes = await setRouters(result.nodes)
    res.status(200).json(result)
})

const getFarendsNodes = asyncHandler( async (req,res) =>{
    const { Link } = await db()
    const {site, nodes, edges } = req.body
    const { routers } = req.query
    const _routers = routers ? true : false
    const result = await Link.getFarendsNodes(site,nodes,edges,_routers)
    result.nodes = await setRouters(result.nodes)
    res.status(200).json(result)
})

const getData = asyncHandler(async (req, res) => {
    console.log("Inicia el getData --------------------------------------------")
    const { Link } = await db()
    const result = await Link.listAllForExcel()
    console.log("ya hizo el listAllForExcel")
    const dir = './src/storage/excelFiles/'
    const excel = `Lista-${moment().format('YYYY-MM-DD-hh-mm-ss')}.xlsx`
    console.log("ya hizo el Estoy aqui")

    const _result = result.map(register => {
        return {
            "Fecha de Validación" : register.validationDate || "",
            "Fecha ForeCast" : register.forecastDate || "",
            "Acción" : register.action || "",
            "Proyecto" : register.project || "",
            "Item" : register.item || "",
            "Enlace" : register.link || "",
            "Instancia" : register.instanceName || "",
            "Distribución" : register.distributionType || "",
            "Medio" : register.media || "",
            "Departamento" : register.departmentCode || "",
            "Estado" : register.status || "",
            "NE" : register.nearEnd.name || "",
            "NE Codigo" : register.nearEnd.code || "",
            "NE Puerto" : register.nearEnd.port || "",
            "NE Latitud" : register.nearEnd.location.coordinates[0] || "",
            "NE Longitud" : register.nearEnd.location.coordinates[1] || "",
            "FE" : register.farEnd.name || "",
            "FE Codigo" : register.farEnd.code || "",
            "FE Puerto" : register.farEnd.port || "",
            "FE Latitud" : register.farEnd.location.coordinates[0] || "",
            "FE Longitud" : register.farEnd.location.coordinates[1] || "",
            "Distancia" : register.distance || "",
            "Capacidad" : register.capacity || "",
            "Utilización" : register.utilization || "",
            "Medio Ingenieria": register.mediaType || "",
            "Configuración" : register.configurationMain || "",
            "Diversidad" : register.diversity || "",
            "Modulación" : register.modulation || "",
            "Ancho de Banda" : register.bandWidth || "",
            "Frecuencia" : register.bandFrequency || "",

            // new fields added
            "MARCA_ANTENA NE": register.nearEnd.antennaBrand || "",
            "MARCA_ANTENA FE": register.farEnd.antennaBrand || "",
            "MODELO_ANTENA_NE": register.nearEnd.antennaModel || "",
            "MODELO_ANTENA_FE": register.farEnd.antennaModel || "",
            "DIAMETRO_ANTENA NE": register.nearEnd.diameter || "",
            "DIAMETRO_ANTENA FE": register.farEnd.diameter || "",
            "GANANCIA_ESTACION_A": register.stationA || "",
            "GANANCIA_ESTACION_B": register.stationB || "",
            "TECNOLOGIA": register.technology || "",
            "TIPO_TRAMA": register.typePlot|| "",
            "ALTURA_RADIANTES NE": register.nearEnd.radiant || "",
            "ALTURA_RADIANTES FE":register.farEnd.radiant || "",
            "Freq tx": register.freqTX || "",
            "Freq Rx":register.freqRX || "",
            "Dirección Clientes 38 Ghz": register.address38 || "",
            "# Solicitud": register.requestNumber || "",
            "Servicios Mayoristas 38Ghz": register.services38 || "",
            "Tipo de Visualización": register.typeVisualization || "",
            "Escenario de Visualización": register.stageVisualization || ""

        }
    })
    console.log(_result[1])
    await saveExcel(_result,'report',excel,dir)

    // res.status(200).json({"link" : `${process.cwd()}/src/storage/excelFiles/${excel}`})

    res.sendFile(`${process.cwd()}/src/storage/excelFiles/${excel}`)
})

const getLinksWithDetail = asyncHandler(async (req, res) => {
    const { Link } = await db()
    res.status(200).json({status : 'in process'})
    const links = await Link.listAllWithDetails()
    const result  = {
        date : moment().format('DD-MM-YYYY hh:mm:ss'),
        enlaces : links
    }
    writeJsonFile(result)
})

const getLinkTypesCounts = asyncHandler(async (req,res) => {
    const { Link } = await db()
    const result = await Link.linkTypesCounts()
    res.status(200).json(result)
})

const getLinksByNearEnd = asyncHandler(async (req,res) => {
    const { ne } = req.query
    if( ne ){
        const { Link } = await db()
        const result = await Link.LinksByNearEnd(ne)
        const _result = result.map(link => {
            return {
                medio : link.media,
                nearend : link.nearEnd.name,
                farend : link.farEnd.name
            }
        })
        res.status(200).json(_result)
    }else{
        res.status(400).json({error : 'Ingrese NearEnd'})
    }

})

const reporteAptAws = asyncHandler(async (req,res) => {
    const { Link, Router } = await db()
    const worksheet = XLSX.readFile(req.file.path, { type: 'base64'})
    // const sitesAws = XLSX.utils.sheet_to_json(worksheet.Sheets['Lista de Sitios APT'])
    const sitesAws = XLSX.utils.sheet_to_json(worksheet.Sheets['Lista de Sitios APT'])

    let _reporte = []
    let reporteItem = {}

    for (const site of sitesAws) {
        let linksByne = await Link.nearEndsOf(site['Sitios APTS'])
        let count = 1
        let router

        reporteItem.Nodo =  site['Sitios APTS']

        while(linksByne.length == 1) {
            router = await Router.findBySiteName(linksByne[0].farEnd.name)
            reporteItem.FE = linksByne.length ? linksByne[0].farEnd.name : undefined
            router ? reporteItem.ROUTER = router.routerNames.toString() : undefined

            reporteItem[`Site ${count}`] = linksByne[0].farEnd.name
            reporteItem[`Medio ${count}`] = linksByne[0].media
            let _linksByne = await Link.nearEndsOf(linksByne[0].farEnd.name)
            let isLinkRecursive = _linksByne[0] && _linksByne[0].farEnd.name === _linksByne[0].nearEnd.name

            if( isLinkRecursive || router){
                break;
            }else{
                linksByne = _linksByne
            }
            count++
        }


        if(reporteItem.ROUTER && !reporteItem.ROUTER.includes('AGG')){
            for (const routerItem of reporteItem.ROUTER.split(',')) {
                let agregadores = new Set()
                let response = await axios.get(`http://10.30.17.81:8084/smartcapex/api/v2/rings?site=${routerItem}`)
                if(response.status === 200){
                    response.data.forEach(item => {
                        item.ringRouters.forEach(subItem => agregadores.add(subItem))
                    })
                }
                reporteItem.AGREGADORES = Array.from(agregadores).toString()
            }

        }

        _reporte.push(reporteItem)
        reporteItem = {}
        count = 1
    }

    const dir = './src/storage/excelFiles/'
    const excel = `reporte_ruben.xlsx`
    await saveExcel(_reporte,'report',excel,dir)

    res.status(200).json({status : _reporte})
})

const getLink = asyncHandler( async (req,res) => {
    const { Link } = await db()
    const { _id } = req.params
    const link = await Link.getLinkById(_id)
    return link
})


//Helpers
const compareInstancesByUtilization = ( a, b ) => {
    if ( a.maxUtilization < b.maxUtilization ){
        return 1;
    }
    if ( a.maxUtilization > b.maxUtilization ){
        return -1;
    }
    return 0;
}

const compareInstancesByThroutput = ( a, b ) => {
    if ( a.throutput < b.throutput ){
        return 1;
    }
    if ( a.throutput > b.throutput ){
        return -1;
    }
    return 0;
}

const getMaxUtilizationByMonth = (history,month) => {
    const filtered = history.filter(link => moment(link.date).format('MM') - 1 == month)
    let utilization = filtered.length > 0 ? filtered.sort(compareInstancesByUtilization)[0].maxUtilization : NaN
    let capacity = filtered.length > 0 ? filtered.sort(compareInstancesByUtilization)[0].capacity : NaN
    return {utilization,capacity}
}

const getMaxThroutputByMonth = (history,month) => {
    const filtered = history.filter(link => moment(link.date).format('MM') - 1 == month)
    let throutput = filtered.length > 0 ? filtered.sort(compareInstancesByThroutput)[0].throutput : 0
    let capacity = filtered.length > 0 ? filtered.sort(compareInstancesByThroutput)[0].capacity : 0
    return {throutput,capacity}
}

const Json2Excel = async (data) => {
    const wb = new xl.Workbook();
    const ws = wb.addWorksheet('Registros');
    const headingColumnNames = [
        "validationDate",
        "project",
        "link",
        "departmentCode",
        "nearEnd.code",
        "nearEnd.name",
        "nearEnd.port",
        "nearEnd.code",
        "nearEnd.name",
        "nearEnd.port"
    ]
    let headingColumnIndex = 1;
    headingColumnNames.forEach(heading => {
        ws.cell(1, headingColumnIndex++)
            .string(heading)
    });

    let rowIndex = 2;
    data.forEach( record => {
        let columnIndex = 1;
        Object.keys(record).forEach(columnName =>{
            ws.cell(rowIndex,columnIndex++)
                .string(record[columnName])
        });
        rowIndex++;
    });
    const filename = `./src/storage/excelFiles/Lista-${moment().format('YYYY-MM-DD')}.xlsx`
    await wb.write(filename);
    return filename
}

const convertToDotNotation = (obj, newObj={}, prefix="") => {

    for(let key in obj) {
        if (typeof obj[key] === "object") {
            convertToDotNotation(obj[key], newObj, prefix + key + ".");
        } else {
            newObj[prefix + key] = obj[key];
        }
    }

    return newObj;
}

function calcDistanceBetweenCoords(coordsA, coordsB) {
    const Lat1 = (coordsA[0] * Math.PI) / 180;
    const Lon1 = (coordsA[1] * Math.PI) / 180;
    const Lat2 = (coordsB[0] * Math.PI) / 180;
    const Lon2 = (coordsB[1] * Math.PI) / 180;
    const distance =
        6378.137 *
        Math.acos(
            Math.cos(Lat1) * Math.cos(Lat2) * Math.cos(Lon2 - Lon1) +
            Math.sin(Lat1) * Math.sin(Lat2)
        );
    return distance;
}

const setRouters = async (nodes) =>{
    const { Router } = await db()
    let _nodes = []
    for (const node of nodes) {
        const router = await Router.findBySiteName(node.label)
        if(router){
            let _node = {
                ...node,
                ...{
                    borderWidth: 4,
                    color: {
                        border: '#44b100',
                        highlight: {
                            border: '#44b100',
                        },
                        hover: {
                            border: '#44b100',
                        }
                    },
                    shapeProperties: {
                        useBorderWithImage: true,
                    },
                    dataRouter : {
                        routerNames : router.routerNames,
                        routerType : router.routerType
                    }
                }
            }
            _nodes.push(_node)
        }else{
            _nodes.push(node)
        }
    }
    return _nodes
}

const writeJsonFile =  (json) => {
    const _json = JSON.stringify(json)
    fs.writeFileSync('/var/www/smart_capex_prod/smartCapex/src/storage/reportLinks/report.json', _json);
}

const prueba = asyncHandler(async (req,res) =>{
    const { Link } = await db()
    const result = await Link.methodPrueba()
    res.status(200).json({total : result})
})

module.exports = {
    getLink,
    getRouterList,
    reporteAptAws,
    getLinksByNearEnd,
    getLinkTypesCounts,
    getData,
    processExcelToJson,
    getFarendsNodes,
    getDependencies,
    listByQuery,
    createLink,
    updateLink,
    deleteLink,
    getTopology,
    mergeLinks,
    getInstancesByString,
    getMaxUtilizationByYear,
    getMaxThroutputByYear,
    getTotalTopology,
    registrarXY,
    getTotalTopologyBySite,
    updateSitePositions,
    getLinksWithDetail,
    prueba
}