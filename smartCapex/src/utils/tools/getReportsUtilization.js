

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

    console.log("rows")
    const report = await db.collection('links_services_E').find({}).toArray()
    console.log(report[0])

    // Save in Excel
    const dir = './store/'
    const excel = `Lista-Utilization-${moment().format('YYYY-MM-DD-hh-mm-ss')}.xlsx`

    let rowFounded = null
    console.log("comparando la data")
    const _result = []
    let i = 0
    let cambio_cap = []
    let cambio_inst = []
    report.forEach((doc, index)=>{
       cambio_cap = []
      cambio_inst = []
        console.log(index)
      if(doc.utilizationHistory &&doc.utilizationHistory !== [] && doc.utilizationHistory[0] && doc.utilizationHistory[0].capacity && doc.utilizationHistory[0].instanceName){
        let current_cap = doc.utilizationHistory[0].capacity
        let current_inst = doc.utilizationHistory[0].instanceName

        for(let util of doc.utilizationHistory){
          if(util  && current_cap !== util.capacity) {
            if(util.date !== "2021-03-25" || util.date!== "2021-05-06"|| util.date!=='2021-05-14' || util.date!=="2021-05-20"){
              cambio_cap.push(`nuevo valor:${util.capacity} - cambio el:${util.date} `)
              current_cap = util.capacity
            }else{
              current_cap = util.capacity
            }
          }
          if(util  && current_inst !== util.instanceName){
            if(util.date !== "2021-03-25" || util.date!== "2021-05-06"|| util.date!=='2021-05-14' || util.date!=="2021-05-20"){
              cambio_inst.push(`nuevo valor:${util.instanceName} - cambio el:${util.date} `)
              current_cap = util.instanceName
            }else{
              current_cap = util.instanceName
            }
          }


        }

        if(cambio_cap===[]){
          cambio_cap.push("sin cambios")
        }
        if(current_inst===[]){
          current_inst.push("sin cambios")
        }


      }else{
        cambio_cap.push(`no tiene utilization history `)
        cambio_inst.push(`no tiene utilization history `)
      }

      _result.push({
        id: `${doc._id}`,
        capacidad: cambio_cap.join(","),
        instancia: cambio_inst.join(",")
      })
    })

    console.log(_result[0])
    await saveExcel(_result,'report',excel,dir)

  console.log('Reporte finalizado');
})


