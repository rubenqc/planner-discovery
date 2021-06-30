const router = require("express").Router();
const {LinkController} = require('../controllers')
const {multerMw} = require('../middlewares')
const {searchRings} = require('../jobs')


router.get(
    "/getLinksWithDetail",
    [LinkController.getLinksWithDetail]
)

router.get(
    "/getLinksByNearEnd",
    [LinkController.getLinksByNearEnd]
)

router.post(
    "/reporte-apt-aws",
    [multerMw.uploadExcel, LinkController.reporteAptAws]
)

router.get('/rings', async (req,res) => {
    const {site} = req.query
    const result =  await searchRings(site)
    res.json(result)
})


module.exports = router