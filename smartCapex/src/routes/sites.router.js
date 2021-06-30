const router = require("express").Router();
const {SiteController} = require('../controllers')



router.post(
    "/getAllSite",
    [SiteController.getAllSites]
)

router.post(
    "/createSite",
    [SiteController.createSite]
)

//editando Site
router.patch(
    "/:_id/updateSite",
    [SiteController.updateSite]
)

//supress Site
router.delete(
    "/:_id/deleteLink",
    [SiteController.deleteSite]
)

module.exports = router