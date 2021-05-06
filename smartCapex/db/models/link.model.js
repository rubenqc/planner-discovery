const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');

const endSchema = new Schema({
    code: String,
    name: String,
    port : String,
    antennaBrand: String,   //added 24/03/21
    antennaModel: String,   //added 24/03/21
    diameter: String,   //added 24/03/21
    radiant: String,   //added 24/03/21
    x : Number,
    y : Number,
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default : 'Point',
            required: true
        },
        coordinates: {
            type: [Number],
            default : [0,0],
            required: true
        }
    }
},{_id : false})

const logSchema = new Schema({
    date: String,
    maxUtilization : Number,
    capacity : String,
    instanceName : String,
    throutput : Number
})

const linkSchema = new Schema({
    validationDate : String,
    forecastDate : String,
    acc_upl : {
        type : String,
        default : 'uplink'
    },
    updatedDate: String,
    updatedDFDate : String,
    action : String,
    project : String,
    item : Number,
    link : String,
    gestor : String,
    instanceName : String,
    utilizationHistory : [logSchema],
    lastMaxutilization : String,
    lastMaxUtilQA: Number,
    distributionType : {
        type : String,
        default : 'Urbano'
    },
    media : {
        type : String,
    },
    mediaType : String,
    departmentCode : String,
    status : {
        type : String,
        enum : ['danger','warning','ok','observado','sin-instancia'],
        default : "ok"
    },
    nearEnd : {
        type : endSchema
    },
    farEnd : {
        type : endSchema
    },
    distance : String,
    capacity : String,
    utilization : String,
    configurationMain : String,
    diversity : String,
    modulation : String,
    bandWidth : String,
    priority : {
        type : Number,
        default : 0,
        enum : [0,1,2,3]
    },
    bandFrequency : String,
    agg : String,
    anillo : Number,
    cola : Number,
    zona : Number,
    technology: String,     //added 24/03/21
    stationA: String,       //added 24/03/21
    stationB: String,       //added 24/03/21
    typePlot: String,       //added 24/03/21
    freqTX: String,     //added 24/03/21
    freqRX: String,     //added 24/03/21
    address38: String,      //added 24/03/21
    requestNumber: Number,      //added 24/03/21
    services38: String,     //added 24/03/21
    typeVisualization: String,      //added 24/03/21
    stageVisualization: String,     //added 24/03/21
    documentState : {
        type : Boolean,
        default : true,
        select: false
    },

},{versionKey : false})

linkSchema.plugin(mongoosePaginate);


//module.exports = (conn) => conn.model('links',linkSchema)
module.exports = linkSchema
