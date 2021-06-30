const express = require('express')
const router = express.Router()
const LinksRouter = require('./links.router')
const RoutersRouter = require('./routers.router')
const SitesRouter = require('./sites.router')


router.use('/links', LinksRouter)
router.use('/routers', RoutersRouter)
router.use('/sites', SitesRouter)

module.exports = router