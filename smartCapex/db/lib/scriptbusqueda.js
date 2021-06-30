    const db = require('./../../db/index');
const plannerDb = require('planner-db');
const config = require('../../src/jobs/index');
const XSLX = require('xlsx')
const { join } = require('path')
const { existsSync, mkdirSync } = require('fs')
const fs = require('fs');

/* EXTRAEMOS TODOS LOS SITES Y LOS LINK CON LA SIGUIENTE FORMA:
    sites = [{
              name:'0101492_PN_Republica_Juliaca'',
              cordXY: '-15.469028,-70.113667'
              props: ....
         }]
 */

async function getSites(){
    const { Site } = await plannerDb(config.config)
    const sitesData = await Site.findAll()
    let sitesAll =[]
    let cord
    sitesData.forEach( (element) =>{
        if( element.geometry!= null && element.geometry.coordinates!= null  ) {
            cord = element.geometry.coordinates.join()
        }else{
            cord = `don't have coordinates`
        }
        sitesAll.push( {
            name: element.siteName,
            coordXY: cord
        })
    })
    return sitesAll
}

async function getLinks() {
    const { Link }  = await db()
    const linksData = await Link.listAll()
    let links = []
    linksData.forEach( (element) =>{

        links.push( {
            name: element.nearEnd.name,
            coordXY: element.nearEnd.location.coordinates.join(),
            nameLink: element.link
        })
        links.push( {
            name: element.farEnd.name,
            coordXY: element.farEnd.location.coordinates.join(),
            nameLink: element.link
        })
    })
    return links
}
async function filterLinks(linksAll){
    let differentLinksCoord = []
    let links = [linksAll[0]]
    let exist = false

    console.log('farend and nearend')
    for( let i = 0; i < linksAll.length; i++){
        exist = false
        for( let j = 0; j < links.length; j++){

            if(links[j].name === linksAll[i].name){
                exist = true
                if(links[j].coordXY !== linksAll[i].coordXY){
                    differentLinksCoord.push([links[j],linksAll[i]])
                }
                break;
            }
        }
        if(!exist){
            links.push(linksAll[i])
        }
    }
    return [ links, differentLinksCoord ]
}
function reportLinks(links, sites){
    let linkUnionSitesWithCoord = []
    let linskSinCoord = []
    let SitesSinCoord = []
    let onlyLinks = []
    let nameBol = false
    links.forEach(link => {
        nameBol = false
        if(link.coordXY ===`don't have coordinates`) {
            linskSinCoord.push(link)
            nameBol = true
        }

        if(!nameBol){
            sites.forEach( site => {

                if(link.name === site.name){

                    if(site.coordXY ===`don't have coordinates`){
                        SitesSinCoord.push(site)
                    }else if(link.coordXY && site.coordXY) {
                         linkUnionSitesWithCoord.push(link)
                    }
                    nameBol = true
                }
            })
        }
        if(!nameBol){
            onlyLinks.push(link)
        }
    })
    console.log(linkUnionSitesWithCoord.length, linskSinCoord.length, SitesSinCoord.length, onlyLinks.length)
    return { linskSinCoord, SitesSinCoord, onlyLinks}
}
function saveExcel(json, sheetName, excelName, dir) {
    const ws = XSLX.utils.json_to_sheet(json)
    const wb = XSLX.utils.book_new()
    XSLX.utils.book_append_sheet(wb, ws, sheetName)
    // verifying if dir exists
    !existsSync(dir) && mkdirSync(dir, {recursive: true})
    const buf = XSLX.writeFile(wb, join(dir, excelName))
}


async function reports(){
    console.log('START THE REPORT HERE #######################')
    let sites = await getSites()
    console.log(sites.length, 'NUmber of sites')
    let linksAll = await getLinks()
    console.log(linksAll.length, "count of links Totals")
    console.log('FILTERING LINKS')
    let links = await filterLinks(linksAll)
    console.log(links[0].length , 'Number of links')
    console.log('SITES AND LINKS WERE LOADED CORRECTLY')
    console.log('-------------------------------------------------------')
    console.log(' ######################################################')
    console.log('LINKS WITH DIFFERENT COORDINATES')
    console.log(links[1].length)
    console.log('Which points are similar in both database?')
    console.log('-------------------------------------------------------')
    console.log('REPORT OF LINKS')
    const report1  = await reportLinks(links[0], sites)
    console.log(' ######################################################')
    console.log('REPORT OF SITES')
    const report2  = await reportLinks(sites, links[0])

    const json = JSON.stringify(links[0])
    fs.writeFile ("./intersection.json", json, function(err) {
            if (err) throw err;
            console.log('complete');
        }
    );



}


//reports()