'use strict'

const debug = require('debug')('app:link:service')
const moment = require('moment')
const _ = require('lodash')
const oracleDB = require('../../oracle_db/lib')

module.exports = function setupLinks(linkModel, routerModel)  {

    function create(link) {
        return linkModel.create(link)
    }

    async function findByInstanceAndUpdateOrCreate(link){
        // let oldLink = await linkModel.findOne({instanceName : link.instanceName}).exec()
        // console.log(oldLink)
        // if(oldLink){
        //     oldLink.nearEnd
        //     await oldLink.save()
        // }else{
            await linkModel.create(link)
        // }
        return link
    }

    function listWhitoutUtilization(){
        return linkModel.find({"utilizationHistory.0" : { $exists : false }}).exec()
    }

    function getLinkById(_id){
        return linkModel.findById(_id)
    }

    async function createFromMerge (link) {
        const linkByNe = await linkModel.find({
            $or : [
                {'nearEnd.name' : link.nearEnd.name},
                {'farEnd.name' : link.nearEnd.name}
            ]
        })
        const linkByFe = await linkModel.find({
            $or : [
                {'nearEnd.name' : link.farEnd.name},
                {'farEnd.name' : link.farEnd.name}
            ]
        })
        if(linkByNe.length > 0){
            const coords  = linkByNe[0].nearEnd.name == link.nearEnd.name ? linkByNe[0].nearEnd.location.coordinates : linkByNe[0].farEnd.location.coordinates
            _.set(link,'nearEnd.location.coordinates',coords)
        }
        if(linkByFe.length > 0){
            const coords  = linkByFe[0].nearEnd.name == link.farEnd.name ? linkByFe[0].nearEnd.location.coordinates : linkByFe[0].farEnd.location.coordinates
            _.set(link,'farEnd.location.coordinates',coords)
        }

        if(link.nearEnd.location && link.farEnd.location){
            _.set(link,'distance',calcDistanceBetweenCoords(link.nearEnd.location.coordinates,link.farEnd.location.coordinates))
        }
        return linkModel.create(link)
    }

    function findBySites({ne, fe}){
        return linkModel.findOne({'nearEnd.name' : ne, 'farEnd.name' : fe}).exec()
    }

    function update(link,_id) {
        link.updatedDate = moment().format('YYYY-MM-DD')
        return linkModel.findByIdAndUpdate(_id,convertToDotNotation(link))
    }

   function cargaExcel(data){
        return linkModel.updateMany(
            {
              link: data['link'],
              instanceName: data['instanceName']
            },
            {
              $set: data
            }
            )
    }

    function LinksByNearEnd(nearend){
        return linkModel.find({'nearEnd.name' : nearend}).select('nearEnd.name farEnd.name media')
    }

    function deleteLink(_id) {
        return linkModel.findByIdAndUpdate(_id,{documentState : false})
    }

    function listByQuery(pagination,query = {}){
        let {page,rowsPerPage,sort} = pagination

        return  linkModel.paginate(query,{
            page,
            limit : rowsPerPage,
            sort : sort ? sort : undefined
        })
    }

    function listAll(){
        return linkModel.find({documentState: true}).exec()
    }

    function listAllLight(){
        return linkModel.find({documentState: true},{instanceName: true, link: true, capacity: true}).exec()
    }

    function listAllForExcel() {
        return linkModel.find({
                documentState: true
            },
            {
                validationDate: true,
                forecastDate: true,
                action: true,
                project: true,
                item: true,
                link: true,
                instanceName: true,
                distributionType: true,
                media: true,
                departmentCode: true,
                status: true,
                "nearEnd.name": true,
                "nearEnd.code": true,
                "nearEnd.port": true,
                "nearEnd.location.coordinates": true,
                mediaType: true,
                "farEnd.name": true,
                "farEnd.code": true,
                "farEnd.port": true,
                "farEnd.location.coordinates": true,
                distance: true,
                capacity: true,
                utilization: true,
                configurationMain: true,
                diversity: true,
                modulation: true,
                bandWidth: true,
                bandFrequency: true,

                // new fields added
                "nearEnd.antennaBrand": true,
                "farEnd.antennaBrand": true,
                "nearEnd.antennaModel": true,
                "farEnd.antennaModel": true,
                "nearEnd.diameter": true,
                "farEnd.diameter": true,
                stationA: true,
                stationB: true,
                technology: true,
                typePlot: true,
                "nearEnd.radiant": true,
                "farEnd.radiant": true,
                freqTX: true,
                freqRX: true,
                address38: true,
                requestNumber: true,
                services38: true,
                typeVisualization: true,
                stageVisualization: true
            }).exec()
    }
    async function listAllWithDetails(){
        let links = await linkModel.find({documentState: true}).select('-_id').lean().exec()
        const _links = []
        for (const link of links) {
            //Obteniendo dependencias
            let nodes = await getDependenciesList( link.nearEnd.name,[],15 );
            let _nearEnds = []
            nodes.forEach( ne => _nearEnds.includes( ne ) ? null : _nearEnds.push( ne ) )
            _links.push( processLinkToDetails({link,nes : _nearEnds, nesLength :_nearEnds.length}) )

        }

        return _links
    }

    async function updateUtilization({_id, value,date,capacity,instanceName,throutput}){
        console.log('agregar',[_id, value,date,capacity,instanceName,throutput])
        const link = await linkModel.findById(_id)
        console.log('##############################')
        console.log(link)
        console.log('##############################')
        link.utilizationHistory.push({
            date,
            maxUtilization: value,
            capacity,
            instanceName,
            throutput
        })
        const maxValue = getMaxValue(link)
        link.set('utilization', maxValue)
        link.set('lastMaxutilization',getLastUtilizations(link.utilizationHistory))
        link.set('updatedDate', moment().format('YYYY-MM-DD'))
        link.set('lastMaxUtilQA', getLasUtilizationQuality(link.utilizationHistory))

        if(value > 80) link.set('priority', 1)
        else if(value > 70 ) link.set('priority', 2)
        else if (value > 60 )link.set('priority', 3)
        else link.set('priority',0)

        const _link = await link.save()
        return _link
    }

    async function nearEndsOf(name,routers){
        console.log("$$$$$$$$$$$$$$$$$$$$$$$$",routerModel.find())
        let sites = await linkModel.find({'nearEnd.name' : name,'documentState' : true}).exec()
        if(routers){
            const _routers = await routerModel.find({$or : [{'routerType' : 'PAG'}, {'routerType' : 'AGG'}]}).exec()
            const _routerList = _routers.map(_router => _router.siteName)
            sites = sites.filter(site => {
                if(_routerList.includes(site.farEnd.name) && site.gestor === "U2000-Datacom" ){
                    return true
                }
                return false
            })
        }
        return sites
    }

    async function farEndsOf(name,routers){
        let sites = await linkModel.find({'farEnd.name' : name,'documentState' : true}).exec()
        if(routers){
            const _routers = await routerModel.find({$or : [{'routerType' : 'PAG'}, {'routerType' : 'AGG'}]}).exec()
            const _routerList = _routers.map(_router => _router.siteName)
            sites = sites.filter(site => {
                if(_routerList.includes(site.nearEnd.name) && site.gestor === "U2000-Datacom" ){
                    return true
                }
                return false
            })
        }
        return sites
    }

    async function generateSitesTopologyBySinkSite(sinkSite, nodes, edges, hops, hop, routers = false) {
        debug('** Hop ' + hops + ' **')

        nodes = nodes && nodes.length ? nodes : []
        edges = edges && edges.length ? edges : []
        hop = hop ? hop : 1

        // verificamos si es la primera vez que se ejecuta y no las que siguen por recursividad
        if (nodes.length === 0) {
            const fe = await nearEndsOf(sinkSite,routers)
            const ne = await farEndsOf(sinkSite,routers)

            nodes.push({
                label: sinkSite,
                id: 1,
                level: hop,
                feCant :  fe.length,
                neCant : ne.length
            })
        }

        // buscamos todos los enlaces asociados al nodo
        let linksBySinkSite = await mapLinks(sinkSite,routers)


        // los newsSinkSites son los sites nuevos de los que podrían salir ramas.
        let newsSinkSites = []
        if (linksBySinkSite && linksBySinkSite.length > 0) {
            // primero añadimos los nodos que faltan
            for (let i = 0; i < linksBySinkSite.length; i++) {
                // validamos que no haya nodos duplicados
                if (
                    !_.find(
                        nodes,
                        node => node.label === linksBySinkSite[i].sourceSite
                    )
                ) {
                    const nodeMax = _.maxBy(nodes, 'id')

                    const fe = await nearEndsOf(linksBySinkSite[i].sourceSite,routers)
                    const ne = await farEndsOf(linksBySinkSite[i].sourceSite,routers)
                    let icon

                    if(fe.length > 0 && ne.length === 0) icon = '/icons/n.png'
                    else if(fe.length === 0 && ne.length > 0) icon = '/icons/network.svg'
                    else if(fe.length > 0 && ne.length > 0) icon = '/icons/fn.png'

                    nodes.push({
                        label: linksBySinkSite[i].sourceSite,
                        id: nodeMax.id + 1,
                        level: hop + 1,
                        image : icon,
                        feCant :  fe.length,
                        neCant : ne.length,
                    })
                    newsSinkSites.push(linksBySinkSite[i].sourceSite)
                }
            }
            debug('-- despues del primer push --')
            debug(newsSinkSites)

            // segundo añadimos los enlaces que faltan
            const nodeFrom = _.find(nodes, node => node.label === sinkSite)
            const from = nodeFrom.id
            // let ccw = 0;
            for (let j = 0; j < linksBySinkSite.length; j++) {
                // ccw += 0.005;
                const nodeTo = _.find(
                    nodes,
                    node => node.label === linksBySinkSite[j].sourceSite
                )
                const to = nodeTo.id
                if (
                    !_.find(
                        edges,
                        edge =>
                            (edge.from === from && edge.to === to) &&  edge.media === linksBySinkSite[j].media)

                ) {
                    edges.push({
                        from,
                        to,
                        media : linksBySinkSite[j].media,
                        instance : linksBySinkSite[j].instanceName,
                        color: {
                            color: setLinkColor(linksBySinkSite[j].media)[0]
                        },
                        dashes : setLinkColor(linksBySinkSite[j].media)[1],
                        label : linksBySinkSite[j].utilization ? `${linksBySinkSite[j].media}(${ parseFloat(linksBySinkSite[j].utilization).toFixed(2) }%)`  : `${linksBySinkSite[j].media}`,
                        width: 4,
                        // smooth: {type: 'curvedCCW', roundness: ccw}
                        // smooth: {type: 'continuous',}
                    })
                }
                else if(!_.find(
                    edges,
                    edge =>
                        (edge.from === from && edge.to === to) && edge.instance === linksBySinkSite[j].instanceName)
                )
                {
                    edges.push({
                        from,
                        to,
                        media : linksBySinkSite[j].media,
                        instance : linksBySinkSite[j].instanceName,
                        color: {
                            color: setLinkColor(linksBySinkSite[j].media)[0]
                        },
                        dashes : setLinkColor(linksBySinkSite[j].media)[1],
                        label : linksBySinkSite[j].utilization ? `${linksBySinkSite[j].media}(${parseFloat(linksBySinkSite[j].utilization).toFixed(2)}%)`  : `${linksBySinkSite[j].media}`,
                        width: 4,
                        // smooth: {type: 'curvedCCW', roundness: ccw}
                    })
                }
            }
        }

        debug('-- newsSinkSites --')
        debug(newsSinkSites)
        if(hops && hops - 1 > 0 && newsSinkSites.length > 0){
            // console.log('-- entre a la recursividad --')
            for(let newsSinkSite of newsSinkSites){
                const resultRecursive = await generateSitesTopologyBySinkSite(newsSinkSite, nodes, edges, hops - 1, hop + 1, routers)
                nodes = resultRecursive.nodes
                edges = resultRecursive.edges
            }
        }
        return {
            sinkSite,
            nodes,
            edges,
            hops
        }
    }

    async function generateSitesTopologyBySourceSite(sourceSite, nodes, edges, hops, hop,routers = false) {
        debug('** Hop ' + hops + ' **')

        nodes = nodes && nodes.length ? nodes : []
        edges = edges && edges.length ? edges : []
        hop = hop ? hop : 1

        // verificamos si es la primera vez que se ejecuta y no las que siguen por recursividad
        if (nodes.length === 0) {
            const fe = await nearEndsOf(sourceSite,routers)
            const ne = await farEndsOf(sourceSite,routers)
            // let icon

            // if(fe.length > 0 && ne.length === 0) icon = '/icons/n.png'
            // else if(fe.length === 0 && ne.length > 0) icon = '/icons/network.svg'
            // else if(fe.length > 0 && ne.length > 0) icon = '/icons/fn.png'
            nodes.push({
                label: sourceSite,
                id: 1,
                level: hop,
                // image : icon,
                feCant :  fe.length,
                neCant : ne.length
            })
        }

        // buscamos todos los enlaces asociados al nodo
        let linksBySinkSite = await mapLinksSource(sourceSite,routers)

        // los newsSinkSites son los sites nuevos de los que podrían salir ramas.
        let newsSinkSites = []
        if (linksBySinkSite && linksBySinkSite.length > 0) {
            // primero añadimos los nodos que faltan
            for (let i = 0; i < linksBySinkSite.length; i++) {
                // validamos que no haya nodos duplicados
                if (
                    !_.find(
                        nodes,
                        node => node.label === linksBySinkSite[i].sinkSite
                    )
                ) {
                    const nodeMax = _.maxBy(nodes, 'id')

                    const fe = await nearEndsOf(linksBySinkSite[i].sinkSite,routers)
                    const ne = await farEndsOf(linksBySinkSite[i].sinkSite,routers)

                    nodes.push({
                        label: linksBySinkSite[i].sinkSite,
                        id: nodeMax.id + 1,
                        level: hop + 1,
                        feCant :  fe.length,
                        neCant : ne.length,
                    })
                    newsSinkSites.push(linksBySinkSite[i].sinkSite)
                }
            }
            debug('-- despues del primer push --')
            debug(newsSinkSites)

            // segundo añadimos los enlaces que faltan
            const nodeFrom = _.find(nodes, node => node.label === sourceSite)
            const from = nodeFrom.id
            // let ccw = 0;
            for (let j = 0; j < linksBySinkSite.length; j++) {
                // ccw += 0.05;
                const nodeTo = _.find(
                    nodes,
                    node => node.label === linksBySinkSite[j].sinkSite
                )
                const to = nodeTo.id
                if (
                    !_.find(
                        edges,
                        edge =>
                            !(edge.from === to && edge.to === from)  && (edge.media === linksBySinkSite[j].media)
                    )
                ) {
                    edges.push({
                        to : from,
                        from : to,
                        media : linksBySinkSite[j].media,
                        instance : linksBySinkSite[j].instanceName,
                        color: {
                            color: setLinkColor(linksBySinkSite[j].media)[0]
                        },
                        dashes : setLinkColor(linksBySinkSite[j].media)[1],
                        label : linksBySinkSite[j].utilization ? `${linksBySinkSite[j].media}(${parseFloat(linksBySinkSite[j].utilization).toFixed(2)}%)`  : `${linksBySinkSite[j].media}`,
                        width: 4,
                        // smooth: {type: 'curvedCCW', roundness: ccw}
                    })
                }
                else if(!_.find(
                    edges,
                    edge =>
                        (edge.from === to && edge.to === from) && edge.instance === linksBySinkSite[j].instanceName)
                )
                {
                    console.log("ccw2")
                    edges.push({
                        to : from,
                        from : to,
                        media : linksBySinkSite[j].media,
                        instance : linksBySinkSite[j].instanceName,
                        color: {
                            color: setLinkColor(linksBySinkSite[j].media)[0]
                        },
                        dashes : setLinkColor(linksBySinkSite[j].media)[1],
                        label : linksBySinkSite[j].utilization ? `${linksBySinkSite[j].media}(${parseFloat(linksBySinkSite[j].utilization).toFixed(2)}%)`  : `${linksBySinkSite[j].media}`,
                        width: 4,
                        // smooth: {type: 'curvedCCW', roundness: ccw}
                    })
                }
            }
        }

        // debug('-- newsSinkSites --')
        // debug(newsSinkSites)
        if(hops && hops - 1 > 0 && newsSinkSites.length > 0){
            // console.log('-- entre a la recursividad --')
            for(let newsSinkSite of newsSinkSites){
                const resultRecursive = await generateSitesTopologyBySinkSite(newsSinkSite, nodes, edges, hops - 1, hop + 1,routers)
                nodes = resultRecursive.nodes
                edges = resultRecursive.edges
            }
        }
        return {
            sourceSite,
            nodes,
            edges,
            hops
        }
    }

    async function generateTopology(){
        let id = 0
        let edges = []
        // const byNear = await linkModel.distinct('nearEnd.name',{'nearEnd.name' : {$exists : true}}).exec()
        // const byFar = await linkModel.distinct('farEnd.name',{'farEnd.name' : {$exists : true} }).exec()

        const _links = await linkModel.find({})
        let sites = []
        for(const link of _links){
            if(!sites.includes(link.nearEnd.name)) sites.push(link.nearEnd.name)
            if(!sites.includes(link.farEnd.name)) sites.push(link.farEnd.name)
        }

        // let nodes = Array.from([...new Set([...byNear,...byFar])]).map(end => {
        let nodes = sites.map(end => {
            const node = {
                label : end,
                id : id + 1,
                shape : "dot"
            }
            id++
            return node
        });

        for (const nodeFrom of nodes) {
            //de nearEnd a FarEnd
            const farEnds = await farEndsOf(nodeFrom.label)

            farEnds.forEach(link => {
                const nodeTo = _.find(nodes, _node => _node.label === link.nearEnd.name)

                if (
                    !_.find(
                        edges,
                        edge =>
                            (edge.from === nodeFrom.id && edge.to === nodeTo.id) ||
                            (edge.from === nodeTo.id && edge.to === nodeFrom.id)
                    )
                ) {
                    edges.push({
                        from : nodeFrom.id,
                        to :nodeTo.id,
                        width: 4
                    })
                }
            })

            const nearEnds = await nearEndsOf(nodeFrom.label)

            nearEnds.forEach(link => {
                const nodeTo = _.find(nodes, _node => _node.label === link.farEnd.name)
                const indxNode = _.findIndex(nodes,{id : nodeTo.id})
                nodes[indxNode].x = link.farEnd.x || undefined
                nodes[indxNode].y = link.farEnd.y || undefined

                if (
                    !_.find(
                        edges,
                        edge =>
                            (edge.from === nodeFrom.id && edge.to === nodeTo.id) ||
                            (edge.from === nodeTo.id && edge.to === nodeFrom.id)
                    )
                ) {
                    edges.push({
                        from : nodeFrom.id,
                        to :nodeTo.id,
                        width: 4
                    })
                }
            })

        }

        let groups = []

        //ordenando Nodos por grupos
        for (const node of nodes){
            const departament = node.label.split("_")[1]
            if(groups.includes(departament)){
                node.group = groups.indexOf(departament) + 1
            }else{
                groups.push(departament)
                node.group = groups.indexOf(departament) + 1
            }
        }

        // for (const node of nodes){
        //     let link = null
        //     link = await linkModel.findOne({'nearEnd.name' : node.label})
        //     if(link){
        //         node.x = link.nearEnd.x
        //         node.y = link.nearEnd.y
        //     }else{
        //         link = await  linkModel.findOne({'farEnd.name' : node.label})
        //         node.x = link.farEnd.x
        //         node.y = link.farEnd.y
        //     }
        // }

        return {
            nodes,
            edges
        }
    }

    async function getInstancesByString(str){

        // const siteA = await linkModel.distinct('nearEnd.name',{'nearEnd.name' : { $exists: true }})
        // const siteB = await linkModel.distinct('farEnd.name',{'farEnd.name' : { $exists: true }})
        // const sites = [...new Set(siteA,siteB)]
        const _links = await linkModel.find({documentState: true})
        let sites = []
        for(const link of _links){
            if(!sites.includes(link.nearEnd.name)) sites.push(link.nearEnd.name)
            if(!sites.includes(link.farEnd.name)) sites.push(link.farEnd.name)
        }
        return sites

    }

    async function getRoutersList(){

        const _links = await linkModel.find({documentState: true, mediaType : { $in : ['CSR-Rentado','PAG-FO','PAG-MW','PAG-Rentado'] } })
        let sites = []
        for(const link of _links){
            if(!sites.includes(link.nearEnd.name)) sites.push(link.nearEnd.name)
            if(!sites.includes(link.farEnd.name)) sites.push(link.farEnd.name)
        }
        return sites

    }

    async function topologySourceAndSinkBySite(site,routers = false){
        const bySinkSite = await generateSitesTopologyBySinkSite(site,[],[],15,undefined,routers)

        for (const node of bySinkSite.nodes){
            if(node.level){
                delete node.level
            }

            let link = null
            link = await linkModel.findOne({'nearEnd.name' : node.label})
            if(link){
                node.x = link.nearEnd.x
                node.y = link.nearEnd.y
            }else{
                link = await  linkModel.findOne({'farEnd.name' : node.label})
                node.x = link.farEnd.x
                node.y = link.farEnd.y
            }
        }


        //Analizando enlaces repetidos
        let noRepeat = []
        let repeat = []
        for (const edge of bySinkSite.edges) {
            const exist = _.find(noRepeat,(edg) => {
                return (edge.from === edg.from && edge.to === edg.to ) || (edge.from === edg.to && edge.to === edg.from)
            })

            if(exist) repeat.push(edge)
            else noRepeat.push(edge)
        }

        let ccw = 0.1
        let iterate = 'curvedCCW'
        for (const edge of repeat) {
            edge.smooth =  {type: iterate === 'curvedCCW' ? 'curvedCW' : 'curvedCCW' , roundness: ccw}
            ccw+= 0.1
            if(ccw == 0.5) ccw = 0.1
        }

        bySinkSite.edges = [...noRepeat,...repeat]

        return {
            hops : 15,
            site,
            nodes : bySinkSite.nodes,
            edges : bySinkSite.edges
        }

    }

    async function updateSitePositions(nodes){
        let index = 0
        for (const node of nodes) {
            await linkModel.updateMany({'nearEnd.name' : node.label},{
                'nearEnd.x' : node.x,
                'nearEnd.y' : node.y,
            })
            await linkModel.updateMany({'farEnd.name' : node.label},{
                'farEnd.x' : node.x,
                'farEnd.y' : node.y,
            })
            index++
        }
        return {
            total : index
        }
    }

    async function  getDependencies(site,nodes,edges,routers){
        const bySinkSite = await generateSitesTopologyBySinkSite(site,nodes,edges,5,undefined,routers)

        for (const node of bySinkSite.nodes){
            if(node.level){
                delete node.level
            }
            // const farEnds = await nearEndsOf(node.label)

            // if(node.id >= nodes.length && farEnds.length > 0){
            //     node.image = '/icons/network.svg'
            //     let nodeExist = 0
            //     farEnds.forEach(fe => {
            //         const _fe = bySourceSite.nodes.find(_node => _node.label == fe.farEnd.name && _node.id < nodes.length)
            //         if(_fe){
            //             nodeExist++
            //         }
            //     })
            //     console.log(nodeExist)
            //     if(nodeExist >= 1) {
            //         node.image = undefined
            //     }
            // }

            let link = null
            link = await linkModel.findOne({'nearEnd.name' : node.label})
            if(link){
                node.x = link.nearEnd.x
                node.y = link.nearEnd.y
            }else{
                link = await  linkModel.findOne({'farEnd.name' : node.label})
                node.x = link.farEnd.x
                node.y = link.farEnd.y
            }
        }

        //Analizando enlaces repetidos
        let noRepeat = []
        let repeat = []
        for (const edge of bySinkSite.edges) {
            const exist = _.find(noRepeat,(edg) => {
                return (edge.from === edg.from && edge.to === edg.to ) || (edge.from === edg.to && edge.to === edg.from)
            })

            if(exist) repeat.push(edge)
            else noRepeat.push(edge)
        }

        let ccw = 0.1
        let iterate = 'curvedCCW'
        for (const edge of repeat) {
            edge.smooth =  {type: iterate === 'curvedCCW' ? 'curvedCW' : 'curvedCCW' , roundness: ccw}
            ccw+= 0.1
            if(ccw == 0.5) ccw = 0.1
        }
        bySinkSite.edges = [...noRepeat,...repeat]


        return {
            hops : 5,
            site,
            nodes : bySinkSite.nodes,
            edges : bySinkSite.edges
        }
    }

    async function  getFarendsNodes (site, nodes, edges,routers){
        const bySourceSite = await generateSitesTopologyBySourceSite(site,nodes,edges,1,undefined,routers)

        // const index = bySourceSite.nodes.findIndex(node => node.label === site)
        // bySourceSite.nodes[index].image = undefined

        for (const node of bySourceSite.nodes){

            if(node.level){
                delete node.level
            }

            // const nearEnds = await farEndsOf(node.label)
            // const farEnds = await nearEndsOf(node.label)
            //
            // if(node.id >= nodes.length && nearEnds.length > 1){
            //     node.image = '/icons/jerarquia.svg'
            // }
            //
            // if(node.id >= nodes.length && farEnds.length > 0){
            //     console.log(farEnds)
            //     node.image = '/icons/network.svg'
            //     let nodeExist = 0
            //     farEnds.forEach(fe => {
            //         const _fe = bySourceSite.nodes.find(_node => _node.label == fe.farEnd.name && _node.id < nodes.length)
            //         if(_fe){
            //             nodeExist++
            //         }
            //     })
            //     console.log(nodeExist)
            //     if(nodeExist >= 1) {
            //         node.image = undefined
            //     }
            // }

            let link = null
            link = await linkModel.findOne({'nearEnd.name' : node.label})
            if(link){
                node.x = link.nearEnd.x
                node.y = link.nearEnd.y
            }else{
                link = await  linkModel.findOne({'farEnd.name' : node.label})
                node.x = link.farEnd.x
                node.y = link.farEnd.y
            }
        }

        //Analizando enlaces repetidos
        let noRepeat = []
        let repeat = []
        for (const edge of bySourceSite.edges) {
            const exist = _.find(noRepeat,(edg) => {
                return (edge.from === edg.from && edge.to === edg.to ) || (edge.from === edg.to && edge.to === edg.from)
            })

            if(exist) repeat.push(edge)
            else noRepeat.push(edge)
        }

        let ccw = 0.1
        let iterate = 'curvedCCW'
        for (const edge of repeat) {
            edge.smooth =  {type: iterate === 'curvedCCW' ? 'curvedCW' : 'curvedCCW' , roundness: ccw}
            ccw+= 0.1
            if(ccw == 0.5) ccw = 0.1
        }
        bySourceSite.edges = [...noRepeat,...repeat]


        return {
            hops : 2,
            site,
            nodes : bySourceSite.nodes,
            edges : bySourceSite.edges
        }
    }

    async function linkTypesCounts(){
        console.log("IMPRIMIRE LINK MODEL ############################################################")
                console.log(linkModel)
        console.log("#################################################################################")
        let types = await linkModel.distinct("media", { documentState: true })
        let result = {}

        for (const type of types) {
            let resNe = await linkModel.distinct("nearEnd.name",{ media: type, documentState: true, mediaType: { $ne: 'AGG-FO' }}).exec()
            result[type] = resNe.length
        }

        return {
            result,
            types
        }
    }

    function SearchBySites(site1,site2){
        return linkModel.find({
            $or : [
                    {'nearEnd.name' : site1, 'farEnd.name' : site2},
                    {'nearEnd.name' : site2, 'farEnd.name' : site1},
               ]
            }
        )
    }

    // HELPERS
    function getMaxValue(link){
        console.log(link)
        let filtered = link.utilizationHistory
          .filter(log => moment(log.date).format('MM') == moment().format('MM'))
            .sort(compareInstances)

        if(filtered.length <= 0){
            if(parseInt(moment().format('DD')) < 3){
                filtered = link.utilizationHistory
                    .filter(log => parseInt(moment(log.date).format('MM')) == parseInt(moment().format('MM') -1))
                    .sort(compareInstances)
            }
        }
        console.log(filtered)
        return filtered[filtered.length -1].maxUtilization
    }

    function compareInstances( a, b ) {
        if ( a.maxUtilization < b.maxUtilization ){
            return 1;
        }
        if ( a.maxUtilization > b.maxUtilization ){
            return -1;
        }
        return 0;
    }

    async function mapLinks(sinkSite, routers){
        const _routers = await routerModel.find({}).exec()
        const _routerList = _routers.map(_router => _router.siteName)
        const links = await linkModel.find({
            'farEnd.name' : sinkSite,
            'documentState' : true
        })
        let _links = []
        let mediaTypeList = ['CSR-Rentado','PAG-FO','PAG-MW','PAG-Rentado']

        if(routers){
            for (const link of links) {
                if(_routerList.includes(link.nearEnd.name) && link.gestor === "U2000-Datacom" && mediaTypeList.includes(link.mediaType) ){
                    _links.push({
                        sourceSite : link.nearEnd.name,
                        sinkSite : link.farEnd.name,
                        media : link.media,
                        utilization : link.utilization,
                        instanceName : link.instanceName,
                    })
                }
            }
        }else{
            for (const link of links) {
                _links.push({
                    sourceSite : link.nearEnd.name,
                    sinkSite : link.farEnd.name,
                    media : link.media,
                    utilization : link.utilization,
                    instanceName : link.instanceName,
                })
            }
        }
        return _links
    }

    async function mapLinksSource(sourceSite, routers){
        const _routers = await routerModel.find({}).exec()
        const _routerList = _routers.map(_router => _router.siteName)
        const links = await linkModel.find({
            'nearEnd.name' : sourceSite,
            'documentState' : true
        })
        let _links = []
        let mediaTypeList = ['CSR-Rentado','PAG-FO','PAG-MW','PAG-Rentado']


        if(routers){
            for (const link of links) {
                if(_routerList.includes(link.farEnd.name) && link.gestor === "U2000-Datacom" && mediaTypeList.includes(link.mediaType)){
                    _links.push({
                        sourceSite : link.nearEnd.name,
                        sinkSite : link.farEnd.name,
                        media : link.media,
                        utilization : link.utilization,
                        instanceName : link.instanceName,
                    })
                }
            }
        }else{
            for (const link of links) {
                _links.push({
                    sourceSite : link.nearEnd.name,
                    sinkSite : link.farEnd.name,
                    media : link.media,
                    utilization : link.utilization,
                    instanceName : link.instanceName,
                })
            }
        }

        return _links
    }

    const convertToDotNotation = (obj, newObj={}, prefix="") => {

        for(let key in obj) {
            if (typeof obj[key] === "object") {
                convertToDotNotation(obj[key], newObj, prefix + key + ".");
            } else {
                newObj[prefix + key] = obj[key];
            }
        }

        return newObj;
    }

    function calcDistanceBetweenCoords(coordsA, coordsB) {
        const Lat1 = (coordsA[0] * Math.PI) / 180;
        const Lon1 = (coordsA[1] * Math.PI) / 180;
        const Lat2 = (coordsB[0] * Math.PI) / 180;
        const Lon2 = (coordsB[1] * Math.PI) / 180;
        const distance =
            6378.137 *
            Math.acos(
                Math.cos(Lat1) * Math.cos(Lat2) * Math.cos(Lon2 - Lon1) +
                Math.sin(Lat1) * Math.sin(Lat2)
            );
        return distance;
    }

    async function registrarXY(){
        const nodes = require('../../JSN.json')

        let index = 0
        for (const node of nodes) {
            await linkModel.updateMany({'nearEnd.name' : node.label},{
                'nearEnd.x' : node.x,
                'nearEnd.y' : node.y,
            })
            await linkModel.updateMany({'farEnd.name' : node.label},{
                'farEnd.x' : node.x,
                'farEnd.y' : node.y,
            })
            index++
        }
        return {
            total : index
        }
    }

    async function reportUtilizationByOracle(){
        const filter = ["0103820_UY_Huipoca_0101881_UY_Irazola_Medio","0104528_LM_Vilcahuaura_0100381_LM_Vegueta","0100573_LM_Picapiedra_0105151_LM_Galpones"]

        const list = await linkModel.find({"link" : { $in : filter }}).exec()
        let reporte = []

        console.log(`reporte => ${reporte}`)

        for (const link of list) {
            console.log('iterando '+ link.link)
            let collation = await oracleDB.getCollectionTimeByInstanceAndDate({instance : link.instanceName})
            for (const row of collation.rows) {
                console.log(row)
                reporte.push({
                    "NE" : link.nearEnd.name || "",
                    "Latitud_NE" : link.nearEnd.location.coordinates[0] === 0 ? "" : link.nearEnd.location.coordinates[0] ,
                    "Longitud_NE" : link.nearEnd.location.coordinates[1] === 0 ? "" : link.nearEnd.location.coordinates[1] ,
                    "FE" : link.farEnd.name || "",
                    "Latitud_FE" : link.farEnd.location.coordinates[0] === 0 ? "" :  link.farEnd.location.coordinates[0] ,
                    "Longitud_FE" : link.farEnd.location.coordinates[1] === 0 ? "" :  link.farEnd.location.coordinates[1] ,
                    "distancia_km" : link.distance ?  parseFloat(link.distance) : "" ,
                    "configuracion" : link.configurationMain || "",
                    "diversidad" : link.diversity || "" ,
                    "capacidad" : link.capacity ? parseFloat(link.capacity) : "" ,
                    "modulacion" : link.modulation || "" ,
                    "anchoBanda" : link.bandWidth || "" ,
                    "Frecuencia" : link.bandFrequency || "" ,
                    "Instancia Final" : link.instanceName || "" ,
                    "Gestor" : link.gestor || "",
                    "dia y hora" : moment(row[0]).format('DD/MM/YYYY HH:mm:ss')  || "",
                    "utilización RX MAX" : row[1] || "",
                    "utilización TX MAX" : row[2] || ""
                })
            }
        }
        console.log('finalizando en lib')
        return reporte;

    }

    function getLastUtilizations(history){
        const rever = history.slice(-28).reverse()
        let weeks = []
        let process = [null,null,null,null]
        let result = ""
        rever.forEach(log => {
            const week = moment(log.date).week()
            if(!weeks.includes(week) && weeks.length < 5){
                weeks.push(week)
            }
            if(weeks.length < 5){
                const index = weeks.indexOf(week)
                process[index] = process[index] > log.maxUtilization.toFixed(2) ? process[index] : log.maxUtilization.toFixed(2)
            }
        })

        process.forEach((item) =>{
            item !== null ? result += `${item} ` : null
        })

        return result
    }

    function getLasUtilizationQuality(history){
        const rever = history.slice(-13).reverse()
        let weeks = []
        rever.forEach(log => {
            const week = moment(log.date).week()
            log.week = week
            if(!weeks.includes(week)){
                weeks.push({
                    week,
                    count: 0
                })
            }

            const foundWeek = weeks.find(w => w.week === week)
            foundWeek.count = foundWeek.count + 1
        })

        const weekCompleted = weeks.find(w => w.count === 7)
        if(weekCompleted){
            const revertWeek = rever.filter(r => r.week === weekCompleted.week)
            const maxUtils = revertWeek.map(r => r.maxUtilization).sort()
            const mid = Math.ceil(maxUtils.length/2)
            return maxUtils.length % 2 === 0 ? (maxUtils[mid] + maxUtils[mid - 1])/ 2 : maxUtils[mid - 1]
        }

        return null
    }

    function processLinkToDetails({link, nes, nesLength}){

        return {
            "Enlace" : link.link || "",
            "Acceso / Uplinkm" : link.acc_upl || "",
            "Rural / urbano" : link.distributionType || "",
            "medio" : link.media || "",
            "Tipo de Enlace" : link.mediaType || "",
            "Departamento" : link.departmentCode || "",
            "NE" : link.nearEnd.name || "",
            "Latitud_NE" : link.nearEnd.location.coordinates[0] === 0 ? "" : link.nearEnd.location.coordinates[0] ,
            "Longitud_NE" : link.nearEnd.location.coordinates[1] === 0 ? "" : link.nearEnd.location.coordinates[1] ,
            "FE" : link.farEnd.name || "",
            "Latitud_FE" : link.farEnd.location.coordinates[0] === 0 ? "" :  link.farEnd.location.coordinates[0] ,
            "Longitud_FE" : link.farEnd.location.coordinates[1] === 0 ? "" :  link.farEnd.location.coordinates[1] ,
            "agg" : link.agg || "",
            "anillo" : link.anillo || "",
            "cola" :link.cola || "",
            "zona" : link.zona || "",
            "distancia_km" : link.distance ?  parseFloat(link.distance) : "" ,
            "configuracion" : link.configurationMain || "",
            "diversidad" : link.diversity || "" ,
            "capacidad" : link.capacity ? parseFloat(link.capacity) : "" ,
            "modulacion" : link.modulation || "" ,
            "anchoBanda" : link.bandWidth || "" ,
            "Frecuencia" : link.bandFrequency || "" ,
            "Instancia Final" : link.instanceName || "" ,
            "Utilizacion Calidad" : link.lastMaxUtilQA || "" ,
            "Utilizacion" : link.utilization || "" ,
            "Throughput (capacidad x Utilizacion)" : link.utilizationHistory[0] ? link.utilizationHistory[link.utilizationHistory.length - 1].throutput : "" ,
            "Cantidad_Hijos(Nodos_Dependientes)" : nesLength,
            "Lista de Hijos_Dependientes" : nes,
        }
    }

    function setLinkColor(mediaType){
        if(mediaType === 'FO') return ['#48E8F0', false]
        else if(mediaType === 'BH' || mediaType === 'LH' ) return ['#ff9800', true]
        else return ['#ff5100', false]
    }

    async function getDependenciesList(sinkSite, nodes, hops, hop){
        nodes = nodes && nodes.length ? nodes : []
        hop = hop ? hop : 1

        // verificamos si es la primera vez que se ejecuta y no las que siguen por recursividad
        if ( nodes.length === 0 ) nodes.push( sinkSite )

        let linksBySinkSite = await farEndsOf(sinkSite,false)

        let newsSinkSites = []
        if (linksBySinkSite && linksBySinkSite.length > 0) {
            // primero añadimos los nodos que faltan
            for (let i = 0; i < linksBySinkSite.length; i++) {
                // validamos que no haya nodos duplicados
                if ( !nodes.includes( linksBySinkSite[i].nearEnd.name ) ) {
                    nodes.push( linksBySinkSite[i].nearEnd.name )
                    newsSinkSites.push( linksBySinkSite[i].nearEnd.name )
                }
            }
        }
        if(hops && hops - 1 > 0 && newsSinkSites.length > 0){
            for(let newsSinkSite of newsSinkSites){
                const resultRecursive = await getDependenciesList(newsSinkSite, nodes, hops - 1, hop + 1)
                nodes = resultRecursive
            }
        }

        return nodes
    }

    return {
        cargaExcel,
        getRoutersList,
        nearEndsOf,
        LinksByNearEnd,
        linkTypesCounts,
        getDependencies,
        getFarendsNodes,
        topologySourceAndSinkBySite,
        create,
        update,
        listByQuery,
        deleteLink,
        listAll,
        updateUtilization,
        generateSitesTopologyBySinkSite,
        findBySites,
        createFromMerge,
        getInstancesByString,
        getLinkById,
        generateTopology,
        registrarXY,
        updateSitePositions,
        findByInstanceAndUpdateOrCreate,
        listWhitoutUtilization,
        listAllWithDetails,
        reportUtilizationByOracle,
        SearchBySites,
        listAllLight,
        listAllForExcel
    }
}
