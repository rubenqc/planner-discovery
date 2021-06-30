
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

const XSLX = require('xlsx')
const { join } = require('path')
const { existsSync, mkdirSync } = require('fs')

async function saveExcel(json, sheetName, excelName, dir) {
    const ws = XSLX.utils.json_to_sheet(json)
    const wb = XSLX.utils.book_new()
    XSLX.utils.book_append_sheet(wb, ws, sheetName)
    // verifying if dir exists
    !existsSync(dir) && mkdirSync(dir, { recursive: true })
    const buf = await XSLX.writeFile(wb, join(dir, excelName))

    return "ok"
}

module.exports = {
    asyncHandler,
    saveExcel
}