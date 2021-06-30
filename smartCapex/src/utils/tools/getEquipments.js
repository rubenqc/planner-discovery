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

    // seguimos con la conexion a la colección
    const db = client.db('planner_control')


    console.log('obtenemos la data');
    const data = await  db.collection('multiselects').find({name:"modelo"}).toArray()
    const maping = data[0].data
    let row = 0
    let result = []
    maping.forEach((r) => {
      if(r.row !== row){
        row++
        result.push({
          row: row
        })
      }else{
        result[row-1][r.name] = r.value
      }
    })

    console.log(result[2])

    const dir = './store/'
    const excel = `Report_EQUIPOS.xlsx`
    await saveExcel(result,'report',excel,dir)

    console.log('terminamos la extracción');
  })




