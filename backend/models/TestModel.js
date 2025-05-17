const mongoose = require('mongoose');

const Schema = mongoose.Schema;



const testSchema = new Schema({
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
    type: Number
  },
  department: {
    type: String
  },
  lab:{
    type:String
  }
}, { timestamps: true });//as the name says, it adds timestamps to the schema



const reportSchema = new mongoose.Schema({
  category: {
    type: String, required: true
  },
  ref_no: {
    type: String, unique: true, required: true
  },
  department: {
    type: String, required: true
  },
  lab: {
    type: String, required: true
  },
  verified_flag: {
    type: Number, default: 0
  },
  client_name: {
    type: String, required: true
  },
  client_po_no: {
    type: String, required: true
  },
  bill_to_be_sent_mail_address: {
    type: String, required: true
  },
  client_po_recieved_date: {
    type: Date, required: true
  },
  gst_no: {
    type: String, required: true
  },
  faculty_incharge: {
    type: String, required: true
  },
  paid: {
    type: Boolean, default: false
  },
  payment_mode: {
    type: String
  },
  prepared_by: {
    type: String, required: true
  },
  po_file_url: {
    type: String
  },
  total_amount: {
    type: mongoose.Schema.Types.Decimal128, required: true
  },
  transaction_details: {
    type: String
  },
  transaction_date: {
    type: String
  },
  test: [testSchema],
  receipt_no: {
    default: null,
    type: String
  },
  receipt_date: {
    default: null,
    type: Date
  },
  rejected_by: {
    type: String,
    default: null
  },
  paymentVerified: {
    type: Boolean, default: false
  },
  rejected_reason: {
    type: String,
    default: null
  },
  rejected_date: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

const labSchema = new Schema({
  department: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  labs: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

const Test = mongoose.model("Test", testSchema);
const Report = mongoose.model("Report", reportSchema);
const Lab = mongoose.model("Lab", labSchema);
// Export both models as an object
module.exports = {
  Test,
  Report,
  Lab
};
