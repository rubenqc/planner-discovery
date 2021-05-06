const axios = require('axios')
const Planner = require('planner-db')
const { asyncHandler }  = require('../utils')
const debug = require('debug')('app:v1:link-controller')
const config = require('../jobs/index')


// WE EXPORT CRUD METHODS FOR SITES MODULE
const createSite = asyncHandler(async (req,res) => {
    // we recover body from frontend, and create a new site
    debug("get /sites/createSite");
    const { Site } =  await Planner(config.config)
     const { fields } = req.body
    const site = await Site.create(fields)
    res.status(200).json(site)
})


const getAllSites = asyncHandler(async (req,res) => {
    // we get all sites and their fields
   console.log("hola estoy en getallsites")

    const { Site } =  await Planner(config.config)
    console.log(Site)
    const site = await Site.findAll()
    res.status(200).json(site)
})
getAllSites();

const updateSite = asyncHandler(async (req,res) => {
    debug("get /sites/updateSite");
    // we need a param id for update site
    const { Site } =  await Planner(config.config)
    const { fields } = req.body
    const { _id } = req.params
    const site = await Site.update(_id, fields)
    res.status(200).json(site)
})


const deleteSite = asyncHandler(async (req,res) => {
    debug("get /sites/removeSite");
    // we need a param id for remove site
    const { Site } = await Planner(config.config)
    const { _id } = req.params
    const link = await Site.remove(_id)
    res.status(200).json(link)
})



module.exports = {
    createSite,
    getAllSites,
    updateSite,
    deleteSite
}