const reportSchema = require("../models/TestModel");

const createReport = async (req, res) => {
    try {
      const {
        ref_no,
        department,
        verified_flag,
        client_name,
        client_po_no,
        bill_to_be_sent_mail_address,
        client_po_recieved_date,
        gst_no,
        faculty_incharge,
        paid,
        payment_mode,
        prepared_by,
        total_amount,
        test
      } = req.body;
      
      // Cloudinary file path
      const po_file_url = req.file?.path || null;
  
      // Create new Report
      const report = new reportSchema({
        ref_no,
        department,
        verified_flag,
        client_name,
        client_po_no,
        bill_to_be_sent_mail_address,
        client_po_recieved_date,
        gst_no,
        faculty_incharge,
        paid,
        payment_mode,
        prepared_by,
        po_file_url,
        total_amount,
        test: JSON.parse(test)
      });
      console.log("Saving Report");
      console.log(report);
      await report.save();
  
      res.status(201).json({
        success: true,
        message: 'Report created successfully',
        data: report
      });
    } catch (err) {
      console.error('Error creating report:', err);
      res.status(500).json({
        success: false,
        message: 'Server Error',
        error: err.message
      });
    }
  };

module.exports = {
    createReport
}