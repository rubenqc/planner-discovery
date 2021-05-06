const router = require("express").Router();
const {RouterController} = require('../controllers')
const {multerMw} = require('../middlewares')


router.get('/getPagAgg',RouterController.listPagAgg)

router.post(
    "/uploadExcel",
    [multerMw.uploadExcel, RouterController.processExcelToJson]
)

module.exports = router