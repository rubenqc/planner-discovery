const router = require("express").Router();
const {LinkController} = require('../controllers')
const {multerMw} = require('../middlewares')

//obtienendo enlaces paginados y posiblemente filtrados
router.post(
    "/listByQuery",
    [LinkController.listByQuery]
);

//subiendo excel y guardandolo
router.post(
    "/uploadExcel",
    [multerMw.uploadExcel, LinkController.processExcelToJson]
)

//creando Link
router.post(
    "/createLink",
    [LinkController.createLink]
)

//editando Link
router.patch(
    "/:_id/updateLink",
    [LinkController.updateLink]
)

//supress Link
router.delete(
    "/:_id/deleteLink",
    [LinkController.deleteLink]
)

//merge Link
router.post(
    "/mergeLinks",
    [LinkController.mergeLinks]
)

router.get('/topology', [LinkController.getTopology])

//Obteniendo instancias
router.get(
    "/getInstancesByString/:str",
    [LinkController.getInstancesByString]
)

//Obteniendo instancias
router.get(
    "/getRouterList",
    [LinkController.getRouterList]
)

//Obteniendo MaxUtilization  Por mes/:año
router.get(
    "/getMaxUtilizationByYear/:_id/:year",
    [LinkController.getMaxUtilizationByYear]
)

//Obteniendo MaxUtilization  Por mes/:año
router.get(
    "/getMaxThroutputByYear/:_id/:year",
    [LinkController.getMaxThroutputByYear]
)


router.get(
    "/getToph",
    [LinkController.getTotalTopology]
)

router.get(
    "/getTophBySite",
    [LinkController.getTotalTopologyBySite]
)


router.post(
    "/getDependecies",
    [LinkController.getDependencies]
)

router.post(
    "/getFarEnds",
    [LinkController.getFarendsNodes]
)


//Actualizar posiciones de JSNBackup.json
router.get(
    "/updatePositions",
    [LinkController.registrarXY]
)

//actualizar posiciones desde el body
router.patch(
    "/updatePositions",
    [LinkController.updateSitePositions]
)

router.get(
    "/getdata",
    [LinkController.getData]
)

router.get(
    "/:_id/detail",
    [LinkController.getLink]
)

router.get(
    "/prueba",
    [LinkController.prueba]
)

router.get(
    '/getLinkTypesCounts',
    [LinkController.getLinkTypesCounts]
)

//subiendo excel y guardandolo
router.post(
    "/reporte-apt-aws",
    [multerMw.uploadExcel, LinkController.reporteAptAws]
)

module.exports = router