const { ref } = require("pdfkit");
const reportSchema = require("../models/TestModel");
const userSchema = require("../models/UserModel");
const { report } = require("../routes/userRoutes");
const {
  flag,
  findDepartment
} = require("../utils/reportUtils");
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
      console.log(req.file.path);
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
      console.log(req.file);
      await report.save();
      res.status(201).json({
        success: true,
        message: 'Report created successfully',
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

const fetchReports = async (req,res) =>{
  try{
    const user_id = req.user_id;
    const user = await userSchema.findById(user_id);
    const verified = req.params.verified === "true";
    if(!user){
      return res.status(404).json({
        message:"User Not Found !"
      })
    }
    let reports = null;
    if (user.role=="hod"){
        const dept = findDepartment(user.email);
        
        let flg = 0;
        if(verified){
            flg=1;
        }
        reports = await reportSchema.find({
          department:dept,
          verified_flag:flg
        });
        if(!reports){
          return res.status(404).json({
            message:"No reports found for the user"
          })
        }
    }else if(user.role=="staff"){
        const dept = findDepartment(user.email);
          reports = await reportSchema.find({
            department:dept,
            verified_flag:0
          });
          if(!reports){
            return res.status(404).json({
              message:"No reports found for the user"
            })
          }
    }else{
        let flg = flag[user.role];
        if(!verified){
          flg-=1;
        }
        reports = await reportSchema.find({
          verified_flag:flag
        });
    }
    return res.status(200).json({
      message:"Reports fetched successfully",
      reports
    })
    
    
  }catch(error){
    res.status(500).json({
      message:"Internal Server Error while fetching reports",
      error: error
    })
  }
}

const fetchPoFile = async(req,res)=>{
  try{
    const ref_no = req.params.ref_no;
    const report = await reportSchema.findOne({ref_no:ref_no});
    if(!report){
      return res.status(404).json({
        message:"No reports found with given ref_no"
      })
    }
    return res.status(200).json({
      message:"PO File Fetched successfully",
      po_file_url : report.po_file_url
    })
  }catch(error){
    return res.status(500).json({
      message:"Internal server error while fetching PO file",
      error: error
    })
  }
}

const verifyReport = async(req,res) =>{
  try{
    const ref_no = req.body.ref_no;
    if(!ref_no){
      return res.status(404).json({
        message: "Reference Number required for rejection"
      })
    }
    const user_id = req.user_id;
    const user = await userSchema.findById(user_id);
  
    const report = await reportSchema.findOne({ ref_no:ref_no });
    
    
    if(user.role=="staff"){
      return res.status(401).json({
        message : "Staffs doesn't have permission to verify the reports"
      })
    }
    if (!report) {
      return res.status(404).json({
        message: "Report not found"
      });
    }
    report.verified_flag += 1;
    await report.save();
    
    return res.status(200).json({
      message: "Report verified successfully"
    });
  }catch(err){
    return res.status(500).json({
      message : "Internal server while verifying reports",
      error : err
    })
  }
}

const rejectReport = async(req,res)=>{
  try{
    const user_id = req.user_id;
    const ref_no = req.ref_no;
    if(!ref_no){
      return res.status(404).json({
        message: "Reference Number required for rejection"
      })
    }
    const user = await userSchema.findById(user_id);
    if(user.role=="Staff"){
      return res.status(401).json({
        message:"Staff can't reject any reports"
      })
    }
    
    const report = await reportSchema.findOne({ref_no : ref_no});
    report.rejected_by = user.role;
    report.verified_flag = 0;
    await report.save();
    return res.status(200).json({
      message : "Report rejected successfully"
    })
  }catch(err){
    return res.status(500).json({
      message:"Internal Server error while rejecting report",
      error : err
    })
  }
}

module.exports = {
    createReport,
    fetchReports,
    fetchPoFile,
    verifyReport,
    rejectReport
}