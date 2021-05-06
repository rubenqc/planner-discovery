'use strict'


const XLSX = require('xlsx')
const { join } = require('path')
const getConfig = require('../../../db/config')
const  connection = require('../../../db/index')


/*function ExcelDateToJSDate(serial) {
    var utc_days = Math.floor(serial - 25569)
    var utc_value = utc_days * 86400
    var date_info = new Date(utc_value * 1000)

    var fractional_day = serial - Math.floor(serial) + 0.0000001

    var total_seconds = Math.floor(86400 * fractional_day)

    var seconds = total_seconds % 60

    total_seconds -= seconds

    var hours = Math.floor(total_seconds / (60 * 60))
    var minutes = Math.floor(total_seconds / 60) % 60

    return new Date(
        date_info.getFullYear(),
        date_info.getMonth(),
        date_info.getDate() + 1,
        hours,
        minutes,
        seconds
    )
}*/

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

    const wb = await XLSX.readFile(join(__dirname, '/data3.xlsx'))
    console.log("segundo paso")
    let rows = await XLSX.utils.sheet_to_json(wb.Sheets['Hoja1'])

    console.log('-- enlaces --')
    //validationCopies(rows)


    let dataFinal = rows.map(p => {
        for (const prop in p) {
            if (typeof p[prop] === 'string') {
                p[prop] = p[prop].trim()
            }
        }
        return {

            link: p['Enlace'],
            instanceName: p['Instancia'],
            mediaType: p['medio'],
            "nearEnd.antennaBrand": p['MARCA_ANTENA NE'] || null,   //added 24/03/21
            "nearEnd.antennaModel": p['MODELO_ANTENA_NE'] || null,   //added 24/03/21
            "nearEnd.diameter": p['DIAMETRO_ANTENA NE'] || null,   //added 24/03/21
            "nearEnd.radiant": p['ALTURA_RADIANTES NE'] || null,   //added 24/03/21
            "farEnd.antennaBrand": p['MARCA_ANTENA FE'] || null,   //added 24/03/21
            "farEnd.antennaModel": p['MODELO_ANTENA_FE'] || null,   //added 24/03/21
            "farEnd.diameter": p['DIAMETRO_ANTENA FE'] || null,   //added 24/03/21
            "farEnd.radiant": p['ALTURA_RADIANTES FE'] || null,   //added 24/03/21
            technology: p['TECNOLOGIA'] || null,     //added 24/03/21
            stationA: p['GANANCIA_ESTACION_A'] || null,     //added 24/03/21
            stationB: p['GANANCIA_ESTACION_B'] || null,      //added 24/03/21
            typePlot: p['TIPO_TRAMA'] || null,       //added 24/03/21
            freqTX: p['Freq tx'] || null,    //added 24/03/21
            freqRX: p['Freq Rx'] || null,    //added 24/03/21
            address38: p['Dirección Clientes 38 Ghz'] || null,      //added 24/03/21
            services38: p['Servicios Mayoristas 38Ghz'] || null,     //added 24/03/21
            typeVisualization: p['Tipo'] || null,     //added 24/03/21
            stageVisualization: p['Escenario'] || null  //added 24/03/21
        }
    })


    console.log(dataFinal[0])

    const { Link } = await connection(getConfig())
    console.log("Iniciando Actualizacion")

    for( let row of dataFinal){
         await Link.cargaExcel(row)
    }
    console.log("termino actualizacion")
    return

    /* let i = 1
    try {
       for(let p of postsFormatted){
           console.log(p.id)
           console.log(p.postCode)

           // p.id = i
           await Post.create(p)
           i++
       }
   } catch (e){
       console.log(e)
       process.exit(1)
   }

   // process.exit(0)*/
}

main()
