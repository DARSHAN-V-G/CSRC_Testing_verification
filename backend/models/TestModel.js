const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TestSchema = new Schema({
    title: {
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
    },
    quantity: {
        type: Number,
        required : true
    }
},{timestamps: true});//as the name says, it adds timestamps to the schema



const reportSchema = new mongoose.Schema({
    ref_no: { 
        type: String, unique: true, required: true 
    },
    department: {
        type: String, required: true 
    },
    verified_flag: { 
        type: Number, default: 0 
    },
    client_name: { 
        type: String, required: true 
    },
    client_po_no: { 
        type: String , required: true 
    },
    bill_to_be_sent_mail_address: { 
        type: String , required: true 
    },
    client_po_recieved_date: { 
        type: Date , required: true 
    },
    gst_no: { 
        type: String, required: true 
    },
    faculty_incharge: { 
        type: String , required: true 
    },
    paid: { 
        type: Boolean, default: false 
    },
    payment_mode: { 
        type: String , required: true 
    },
    prepared_by: { 
        type: String , required: true 
    },
    po_file_url: { 
        type: String 
    }, 
    total_amount: { 
        type: mongoose.Schema.Types.Decimal128, required: true 
    },
    transaction_details:{
        type:String
    },
    transaction_date:{
        type:String
    },
    test: [TestSchema],
    receipt_no:{
        type:String
    },
    bill_no:{
        type:String
    },
    rejected_by:{
        type:String
    }
}, {
  timestamps: true
});

module.exports = mongoose.model("Report", reportSchema);
