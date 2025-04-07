const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TestSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    unit: {
        type: String,
        required: true,
    },
    pricePerUnit: {
        type: Number,
        required: true
    }
},{timestamps: true});//as the name says, it adds timestamps to the schema

module.exports = mongoose.model('TestModel', TestSchema);
