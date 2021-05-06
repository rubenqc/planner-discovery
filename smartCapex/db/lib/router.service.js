'use strict'

const debug = require('debug')('app:link:service')
const linkModel = require('../models/link.model')


module.exports = function setupRouters(routerModel) {

    async function listPagAgg(){
        const routers = await routerModel.find({$or : [{'routerType' : 'PAG'}, {'routerType' : 'AGG'}]}).exec()
        let routerList = []
        let mediaTypeList = ['CSR-Rentado','PAG-FO','PAG-MW','PAG-Rentado']
        for (const router of routers) {
            const site = await linkModel.findOne({$or : [
                    {'farEnd.name' : router.siteName},
                    {'nearEnd.name' : router.siteName}
                ]})

            if(site && site.gestor === "U2000-Datacom" && mediaTypeList.includes(site.mediaType) && !routerList.includes(router.siteName)){
                routerList.push(router.siteName)
            }
        }
        return routerList;
    }

    function create(router) {
        return routerModel.create(router)
    }

    async function findBySiteName(siteName) {
        const router = await routerModel.findOne({siteName}).exec()
        return router
    }

    async function findBySiteNameAndType(siteName, type) {
        const router = await routerModel.findOne({siteName, routerType : {$in : type}}).exec()
        return router
    }

    async function addRouterNameOrCreate({routerType,siteName,routerName}){
        const router = await routerModel.findOne({siteName}).exec()

        if(router){
            if(!router.routerNames.includes(routerName)){
                router.routerNames.push(routerName)
                await router.save()
            }
        }else{
            routerModel.create({
                routerType,
                siteName,
                routerNames : [routerName]
            })
        }
    }

    return {
        create,
        findBySiteName,
        addRouterNameOrCreate,
        listPagAgg,
        findBySiteNameAndType
    }
}