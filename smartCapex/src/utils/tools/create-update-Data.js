'use strict'


const XLSX = require('xlsx')
const { join } = require('path')
const getConfig = require('../../../db/config')
const  connection = require('../../../db/index')
const  { MongoClient, ObjectId } = require('mongodb');

async function  main(){

    const wb = await XLSX.readFile(join(__dirname, '/updateorcreate.xlsm'))

    let rows = await XLSX.utils.sheet_to_json(wb.Sheets['page1'])
    console.log("Reading excel")


    let dataFinal = rows.map(p => {

        for (const prop in p) {
            if (typeof p[prop] === 'string') {
                p[prop] = p[prop].trim()
            }
        }

        let gestor = p['Medio'] === 'BH' ? 'U2000-TX' : 'U2000-Datacom';
        let status = p['Estado'] === 'OK' ? 'ok' : p['Estado'];

        return {
            // General keys
            link: p['Enlace'],
            acc_upl: "uplink",
            instanceName: p['Instancia'] || null,
            distributionType: p['Tipo de Distribución'] || null,
            media: p['Medio'] || null,
            mediaType: p['Medio ING'] || null,
            status: status || null,
            distance: p['Distancia'] || null,
            departmentCode: p['Departamento'] || null,
            documentState: true || null,
            gestor: gestor || null,
            capacity: p['Capacidad'] || null,
            utilization: p['UTILIZACIÓN'] || null,
            modulation: p['Modulación'] || null,
            bandWidth: p['Ancho de Banda'] || null,
            bandFrequency: p['Frecuencia'] || null,
            configurationMain: p['Configuración'] || null,
            diversity: p['Diversidad'] || null,
            // NE keys

            "nearEnd.code": p['NE Codigo'] || null,
            "nearEnd.name": p['NE_Name'] || null,
            "nearEnd.location.type": "Point",
            "nearEnd.location.coordinates": [p["NE Latitud"] || null,p["NE Longitud"] || null],
            "nearEnd.antennaBrand": p['NE Marca de antena'] || null,
            "nearEnd.antennaModel": p['NE Modelo de Antena'] || null,
            "nearEnd.diameter": p['NE Diametro de antena'] || null,
            "nearEnd.radiant": p['NE Altura radiantes'] || null,
            // FE Keys
            "farEnd.name": p['FE_Name'] || null,
            "farEnd.code": p['FE Codigo'] || null,
            "farEnd.location.type": "Point",
            "farEnd.location.coordinates": [p["FE Latitud"] || null,p["FE Longitud"] || null],
            "farEnd.antennaBrand": p['FE Marca de antena'] || null,
            "farEnd.antennaModel": p['FE Modelo de Antena'] || null,
            "farEnd.diameter": p['FE Diametro de antena'] || null,
            "farEnd.radiant": p['FE Altura radiantes'] || null,
            // New Keys
            technology: p['TECNOLOGIA'] || null,
            stationA: p['GANANCIA_ESTACION_A'] || null,
            stationB: p['GANANCIA_ESTACION_B'] || null,
            typePlot: p['TIPO_TRAMA'] || null,
            freqTX: p['Freq tx'] || null,
            freqRX: p['Freq Rx'] || null,
            address38: p['Dirección Clientes 38 Ghz'] || null,
            services38: p['Servicios Mayoristas 38Ghz'] || null,
            typeVisualization: p['Tipo'] || null,
            stageVisualization: p['Escenario'] || null
        }
    })

    console.log("Excel process finished")
    console.log(dataFinal[0])
    console.log("Connecting with DB")

   let dataLink = null
    MongoClient.connect('mongodb://10.30.17.81:27017',
      {useUnifiedTopology: true },
      async (err, client) => {
          if(err){
              return 'La conexión fallo';
          }

          console.log('la conexión fue exitosa');

          const db = client.db('palantir')


          console.log('processing data');

          dataFinal.forEach((data)=>(
            db.collection('links_services').updateOne(
              {
                  link: data.link,
                  typeVisualization: data.typeVisualization,
                  stageVisualization: data.stageVisualization
              },
              {
                  $set: data
              },
              { upsert: true }
            )
          ))



          console.log('terminamos el update');
      })

}

main()
