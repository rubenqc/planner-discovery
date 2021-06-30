const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const routerSchema = new Schema({
    routerType : {
        type : String,
        required : true
    },
    siteName : {
        type : String,
        required : true
    },
    routerNames : {
        type : Array,
        default : []
    }
},{versionKey : false})

module.exports = routerSchema