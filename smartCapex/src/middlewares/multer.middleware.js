const multer = require('multer');
const path = require('path');
const debug = require('debug')('app:v1:multer')

const storage = multer.diskStorage({
    destination: path.join(__dirname, '../storage/excelFiles'),
    filename:  (req, file, cb) => {
        cb(null, file.originalname);
    }
})
const uploadExcel = multer({
    storage,
    limits: {fileSize: 12000000}
}).single('excel');

module.exports = {
    uploadExcel
}
