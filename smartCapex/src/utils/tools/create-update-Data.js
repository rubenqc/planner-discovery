'use strict'


const XLSX = require('xlsx')
const { join } = require('path')
const getConfig = require('../../../db/config')
const  connection = require('../../../db/index')
const  { MongoClient, ObjectId } = require('mongodb');


async function  main(){

    const wb = await XLSX.readFile(join(__dirname, '/nomacros.xlsx'))

    // let rows = await XLSX.utils.sheet_to_json(wb.Sheets['Backup B'])
    let rows = await XLSX.utils.sheet_to_json(wb.Sheets['Data '])
    console.log("Reading excel")


    let dataFinal = await rows.map(p => {

        for (const prop in p) {
            if (typeof p[prop] === 'string') {
                p[prop] = p[prop].trim()
            }
        }

        let gestor = p['Medio'] === 'BH' ? 'U2000-TX' : 'U2000-Datacom';
        let status = p['Estado'] === 'OK' ? 'ok' : p['Estado'];

        return {
            // General keys
            // _id: new ObjectId(p['id']) || null,
            link: p['Enlace'],
            acc_upl: "uplink",
            instanceName: p['Instancia'] || null,
            distributionType: p['Distribución'] || null,
            media: p['Medio'] || null,
            mediaType: p['Medio Ingenieria'] || null,
            status: status || null,
            distance: p['Distancia'] || null,
            departmentCode: p['Departamento'] || null,
            documentState: true || null,
            gestor: gestor || null,
            capacity: p['Capacidad'] || null,
            utilization: p['Utilización'] || null,
            modulation: p['Modulación'] || null,
            bandWidth: p['Ancho de Banda'] || null,
            bandFrequency: p['Frecuencia'] || null,
            configurationMain: p['Configuración'] || null,
            diversity: p['Diversidad'] || null,
            // NE keys
          nearEnd: {
            code: p['NE Codigo'] || null,
            name: p['NE'] || null,
            location: {
              type: "Point",
              coordinates: [p["NE Latitud"] || null, p["NE Longitud"] || null]
            },
            antennaBrand: p['MARCA_ANTENA NE'] || null,
            antennaModel: p['MODELO_ANTENA_NE'] || null,
            diameter: p['DIAMETRO_ANTENA NE'] || null,
            radiant: p['ALTURA_RADIANTES NE'] || null,
          },


            // "nearEnd.code": p['NE Codigo'] || null,
            // "nearEnd.name": p['NE'] || null,
            // "nearEnd.location.type": "Point",
            // "nearEnd.location.coordinates": [p["NE Latitud"] || null,p["NE Longitud"] || null],
            // "nearEnd.antennaBrand": p['MARCA_ANTENA NE'] || null,
            // "nearEnd.antennaModel": p['MODELO_ANTENA_NE'] || null,
            // "nearEnd.diameter": p['DIAMETRO_ANTENA NE'] || null,
            // "nearEnd.radiant": p['ALTURA_RADIANTES NE'] || null,
            // FE Keys
          farEnd: {
            code: p['FE Codigo'] || null,
            name: p['FE'] || null,
            location: {
              type: "Point",
              coordinates: [p["FE Latitud"] || null, p["FE Longitud"] || null]
            },
            antennaBrand: p['MARCA_ANTENA FE'] || null,
            antennaModel: p['MODELO_ANTENA_FE'] || null,
            diameter: p['DIAMETRO_ANTENA FE'] || null,
            radiant: p['ALTURA_RADIANTES FE'] || null,
          },
            // "farEnd.name": p['FE'] || null,
            // "farEnd.code": p['FE Codigo'] || null,
            // "farEnd.location.type": "Point",
            // "farEnd.location.coordinates": [p["FE Latitud"] || null,p["FE Longitud"] || null],
            // "farEnd.antennaBrand": p['MARCA_ANTENA FE'] || null,
            // "farEnd.antennaModel": p['MODELO_ANTENA_FE'] || null,
            // "farEnd.diameter": p['DIAMETRO_ANTENA FE'] || null,
            // "farEnd.radiant": p['ALTURA_RADIANTES FE'] || null,
            // New Keys
            technology: p['TECNOLOGIA'] || null,
            stationA: p['GANANCIA_ESTACION_A'] || null,
            stationB: p['GANANCIA_ESTACION_B'] || null,
            typePlot: p['TIPO_TRAMA'] || null,
            freqTX: p['Freq tx'] || null,
            freqRX: p['Freq Rx'] || null,
            // address38: p['Dirección Clientes 38 Ghz'] || null,
            // services38: p['Servicios Mayoristas 38Ghz'] || null,
            typeVisualization: p['Tipo de Visualización'] || null,
            stageVisualization: p['Escenario de Visualización'] || null
        }
    })

    console.log("Excel process finished")
    console.log(dataFinal[1])
    console.log("Connecting with DB")
  // return

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
            let count = 0
          dataFinal.forEach((data)=>{
            count++
              console.log(count)
            db.collection('links_services_Z').insertOne({...data}
              // {
              //     _id: new ObjectId(data.id)
              //     // link: data.link,
              //     // typeVisualization: data.typeVisualization,
              //     // stageVisualization: data.stageVisualization
              // },
              // {
              //     $set: data
              // }
              // { upsert: true }
            ) }
          )



          console.log('terminamos el update');
      })

}
 main()
