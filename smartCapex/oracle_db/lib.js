const dao  = require('./dao')

async function getCollectionTimeByInstanceAndDate({instance, dateStr}){
    // let sql = `select COLLECTION_TIME,PORT_RX_BW_UTILIZATION_MAX,PORT_TX_BW_UTILIZATION_MAX from TX_HUAWEI.VW_U2020_RTN_PTN_HH@DBGENLNK
    // where resource_name = '${instance}'
    //             and TO_DATE(COLLECTION_TIME, 'DD/MM/YY') = TO_DATE('${dateStr}', 'DD/MM/YY') ORDER BY COLLECTION_TIME ASC`

    let sql = `select COLLECTION_TIME,PORT_RX_BW_UTILIZATION_MAX,PORT_TX_BW_UTILIZATION_MAX from TX_HUAWEI.VW_U2020_RTN_PTN_HH@DBGENLNK 
    where resource_name = '${instance}' ORDER BY COLLECTION_TIME ASC`

    return  await dao.open(sql,[],false, null)
}

module.exports = {
    getCollectionTimeByInstanceAndDate
}