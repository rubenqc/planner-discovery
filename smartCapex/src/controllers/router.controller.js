const  db =  require('../../db')
const debug = require('debug')('app:v1:router-controller')
const { asyncHandler }  = require('../utils')
const XLSX = require('xlsx')
const fs = require('fs')

const listPagAgg = asyncHandler(async (req,res) => {
    debug("get /routers/listPagAgg");
    const { Router } = await db()
    const routers = await Router.listPagAgg()
    res.status(200).json(routers)
})

const processExcelToJson = asyncHandler(async (req,res) => {
    const { Router } = await db()
    const worksheet = XLSX.readFile(req.file.path, { type: 'base64'})
    const enlaces = XLSX.utils.sheet_to_json(worksheet.Sheets['Hoja1'])
    const resultado = [];
    const resultado2 = [];



    for(const enlace of enlaces){
        const router = await Router.findBySiteName(enlace.NODO,enlace.PAG)
        if(router.routerType){
            resultado.push(router)
        }else{
            resultado2.push((router))
        }
    }

    await fs.unlink(req.file.path, (err) => {
        if (err) {
            console.error(err)
            res.send('error eliminado archivo')
        }
        res.status(200).json({resultado, resultado2})
    })
})

module.exports = {
    listPagAgg,
    processExcelToJson
}