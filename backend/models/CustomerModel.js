const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const customer = new Schema({
    name : {type:String, required : true},
    address : {type:String,required : true},
    gstno : {type:String,required : true},
    department : {type : String, required : true}
}, { timestamps: true });

module.exports = mongoose.model('CustomerModel',customer);