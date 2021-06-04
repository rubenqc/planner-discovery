const axios = require('axios');
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


async function generateReportRan() {
  //Get data from API of Sites
  const data = await axios.get('http://10.30.17.125/oymapi/apisites/listall_Implementacion_RAN_Nodos')
  const result = data.data.Data
  console.log(result[1])
  let report = []

  // Filter the sites with problems
  for (row of result){
    if ( !(/entel/i).test(row.Torrera) && !row.EjeFanja ) {
      report.push(row)
    }
  }

  console.log(report.length)

  // Save in excel for generate report
  const dir = './store/'
  const excel = `Report_RAN.xlsx`
  await saveExcel(report,'report',excel,dir)
}

generateReportRan()