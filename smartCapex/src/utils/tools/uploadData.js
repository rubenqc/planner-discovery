'use strict'


const XLSX = require('xlsx')
const { join } = require('path')
const getConfig = require('../../../db/config')
const  connection = require('../../../db/index')



function validationCopies(data){
    let incorrect = [];
    let correct = [];

    data.forEach( (row) => {
        let repeat = false
        let condition = false
        correct.forEach((copy) => {

            if (copy['Enlace'].trim() === row['Enlace'].trim() && copy['Instancia'] === row['Instancia']  ) {
                repeat = true
                incorrect.push(row)
            }
        })
        if(!repeat){
            correct.push(row)
        }
    })
}

async function  main(){

    const wb = await XLSX.readFile(join(__dirname, '/data.xlsx'))
    console.log("segundo paso")
    let rows = await XLSX.utils.sheet_to_json(wb.Sheets['Sheet3'])

    console.log('-- enlaces --')
    //validationCopies(rows)


    let dataFinal = rows.map(p => {
        for (const prop in p) {
            if (typeof p[prop] === 'string') {
                p[prop] = p[prop].trim()
            }
        }



        let status = p['Estado'] === 'OK' ? 'ok' : p['Estado'];
        return {

            link: p['Enlace'].trim(),
            instanceName: p['Instancia'].trim() || null,
            distributionType: p['Tipo de Distribución'] || null,
            media: p['Medio'] || null,
            mediaType: p['Medio tx'] || null,
            status: status || null,
            distance: p['Distancia'] || null,
            departmentCode: p['Departamento'] || null,
            documentState: true || null,

            capacity: Number(p['Capacidad']) || null,
            utilization: p['Utilización'] || null,
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
            "nearEnd.antennaBrand": p['MARCA_ANTENA NE'] || null,
            "nearEnd.antennaModel": p['MODELO_ANTENA_NE'] || null,
            "nearEnd.diameter": p['DIAMETRO_ANTENA NE'] || null,
            "nearEnd.radiant": p['ALTURA_RADIANTES NE'] || null,
            // FE Keys
            "farEnd.name": p['FE_Name'] || null,
            "farEnd.code": p['FE Codigo'] || null,
            "farEnd.location.type": "Point",
            "farEnd.location.coordinates": [p["FE Latitud"] || null,p["FE Longitud"] || null],
            "farEnd.antennaBrand": p['MARCA_ANTENA FE'] || null,
            "farEnd.antennaModel": p['MODELO_ANTENA_FE'] || null,
            "farEnd.diameter": p['DIAMETRO_ANTENA FE'] || null,
            "farEnd.radiant": p['ALTURA_RADIANTES FE'] || null,
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


    console.log(dataFinal[0])

    const { Link } = await connection(getConfig())
    console.log("Iniciando Creación")

    for( let row of dataFinal){
         await Link.cargaExcel(row)
    }
    console.log("termino la creación")
    return

}

main()
