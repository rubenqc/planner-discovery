

const moment = require('moment')
const  { MongoClient, ObjectId } = require('mongodb');
const { existsSync, mkdirSync } = require('fs')
const XSLX = require('xlsx')
const { join } = require('path')

async function saveExcel(json, sheetName, excelName, dir) {
  const ws = XSLX.utils.json_to_sheet(json)
  const wb = XSLX.utils.book_new()
  XSLX.utils.book_append_sheet(wb, ws, sheetName)
  // verifying if dir exists
  !existsSync(dir) && mkdirSync(dir, { recursive: true })
  const buf = await XSLX.writeFile(wb, join(dir, excelName))

  return "ok"
}



let dataLink = null
MongoClient.connect('mongodb://10.30.17.81:27017',
  {useUnifiedTopology: true },
  async (err, client) => {
    if(err){
      return 'La conexión fallo';
    }

    console.log('la conexión fue exitosa');

    // Choose a DB

    const db = client.db('palantir')

    /*    await  db.collection('links').find().forEach(
           (d) => {
             db2.collection('links_Services').insertOne(d) })
    /*dataLink = await  db.collection('links_B').find({})
      .forEach((d) =>
        db2.collection('links_services_B').insertOne(d)
      )*/

    console.log("rows")
    const report = await db.collection('links_services_D').find({}).toArray()
    console.log(report[0])
    const report2 = await db.collection('links_services_E').find({}).toArray()
    console.log(report2[0])
    // Save in Excel
    const dir = './store/'
    const excel = `Lista-${moment().format('YYYY-MM-DD-hh-mm-ss')}.xlsx`

    /*const _result = report.map(register => {
      return {
        "id": `${register._id}`,
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
    })*/
    let rowFounded = null
    console.log("comparando la data")
    const _result = []
    let i = 0
    report2.forEach( row2 => {

      rowFounded = report.filter(row => `${row._id}` === `${row2._id}`)
      console.log(i)
      i++
      if (rowFounded[0]) {
        let instance = null
        if (rowFounded[0] && row2) {
          instance = rowFounded[0].instanceName === row2.instanceName ? "No cambio" : "Cambio"
        }

        let farend = null
        if (rowFounded[0] && row2) {
          farend = rowFounded[0].farEnd.name === row2.farEnd.name ? "No cambio" : "Cambio"
        }

        let link = null
        if (rowFounded[0] && row2) {
          link = rowFounded[0].link === row2.link ? "No cambio" : "Cambio"
        }

        let nearend = null
        if (rowFounded[0]&& row2) {
          nearend = rowFounded[0].nearEnd.name === row2.nearEnd.name ? "No cambio" : "Cambio"
        }

        let media = null
        if (rowFounded[0] && row2) {
          media = rowFounded[0].media === row2.media ? "No cambio" : "Cambio"
        }

        let mediaType = null
        if (rowFounded[0] && row2) {
          mediaType = rowFounded[0].mediaType === row2.mediaType ? "No cambio" : "Cambio"
        }

        let capacity = null
        if (rowFounded[0] && row2) {
          capacity = rowFounded[0].capacity === row2.capacity ? "No cambio" : "Cambio"
        }
        console.log(rowFounded[0].link)


        _result.push({
          id: `${row2._id}`,
          Link: link,
          InstanceName: instance,
          Capacidad: capacity,
          Farend: farend,
          Nerend: nearend,
          Medio: media,
          Medio_Ing: mediaType,
        })
      } else {
        _result.push({
          id: `${row2._id}`,
          Link: "enlace nuevo",
          InstanceName: "enlace nuevo",
          Capacidad: "enlace nuevo",
          Farend: "enlace nuevo",
          Nerend: "enlace nuevo",
          Medio: "enlace nuevo",
          Medio_Ing: "enlace nuevo",
        })
      }
    })
    console.log(_result[0])
    await saveExcel(_result,'report',excel,dir)

  console.log('Reporte finalizado');
})


