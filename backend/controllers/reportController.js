
const userSchema = require("../models/UserModel");
const {validateEmail} = require("../utils/userUtils");
const {
  Report,
  Lab
} = require("../models/TestModel");
const { report } = require("../routes/userRoutes");
const {
  flag,
  findDepartment
} = require("../utils/reportUtils");
const UserModel = require("../models/UserModel");
const createReport = async (req, res) => {
  try {
    const user_id = req.user_id;
    const user = await userSchema.findById(user_id);
    if (!user) {
      return res.status(401).json({
        messsage: "User not found"
      })
    }
    const {
      category,
      ref_no,
      department,
      lab,
      verified_flag,
      client_name,
      client_po_no,
      bill_to_be_sent_mail_address,
      client_po_recieved_date,
      gst_no,
      faculty_incharge,
      paid,
      payment_mode,
      transaction_details,
      transaction_date,
      prepared_by,
      total_amount,
      test
    } = req.body;

    // Cloudinary file path
    console.log(req.file.path);
    const po_file_url = req.file?.path || null;

    // Create new Report
    const report = new Report({
      category,
      ref_no,
      department,
      lab,
      verified_flag,
      client_name,
      client_po_no,
      bill_to_be_sent_mail_address,
      client_po_recieved_date,
      gst_no,
      faculty_incharge,
      paid,
      payment_mode,
      transaction_details,
      transaction_date,
      prepared_by,
      po_file_url,
      total_amount,
      test: JSON.parse(test),
      createdAt: new Date()
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

const fetchReports = async (req, res) => {
  try {
    const user_id = req.user_id;
    const user = await userSchema.findById(user_id);
    const verified = req.params.verified === "true";
    if (!user) {
      return res.status(404).json({
        message: "User Not Found !"
      })
    }
    let reports = null;
    if (user.role == "hod") {
      const dept = findDepartment(user.email);
      if (!verified) {
        reports = await Report.find({
          department: dept,
          verified_flag: 0,
          rejected_by: { $in: [null, undefined] }
        });
      }
      else {
        reports = await Report.find({
          department: dept,
          verified_flag: { $gte: 1 }
        });
      }
    } else if (user.role == "staff") {
      const dept = findDepartment(user.email);
      if (!verified) {
        reports = await Report.find({
          department: dept,
          verified_flag: 0,
          rejected_by: { $exists: true, $ne: null }
        });
      } else {
        reports = await Report.find({
          department: dept,
          rejected_by: { $in: [null, undefined] }
        });
      }
    } else if (user.role == "office") {
      if (!verified) {
        reports = await Report.find({
          verified_flag: { $gte: 1 },
          paid: true,
          paymentVerified: false,
        });
      } else {
        reports = await Report.find({
          paid: true,
          paymentVerified: true,
        });
      }
    } else {
      let flg = flag[user.role];
      if (verified) {
        reports = await Report.find({
          verified_flag: { $gte: flg }
        });
      } else {
        flg = flg - 1;
        reports = await Report.find({
          verified_flag: flg
        });
      }
    }
    if (!reports) {
      return res.status(404).json({
        message: "No reports found for the user"
      });
    }
    return res.status(200).json({
      message: "Reports fetched successfully",
      reports
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error while fetching reports",
      error: error
    })
  }
}

const fetchAll = async (req, res) => {
  try {
    const user_id = req.user_id;
    const user = await userSchema.findById(user_id);
    if (!user) {
      return res.status(404).json({
        message: "User Not Found !"
      });
    }
    if (user.role != 'dean') {
      return res.status(401).json({
        message: "Only dean can fetch all reports"
      });
    }
    const reports = await Report.find({
      verified_flag: { $gte: 4 },
      paid: true,
      paymentVerified: true
    });
      if (!reports) {
      return res.status(404).json({
        message: "No reports found!"
      });
    }

    return res.status(200).json({
      message: "Reports fetched successfully",
      reports
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error while fetching all reports",
      error: error
    });
  }
}

const fetchReportsWithoutReceipt = async (req, res) => {
  try {
    const user_id = req.user_id;
    const user = await userSchema.findById(user_id);
    if (!user) {
      return res.status(404).json({
        message: "User Not Found !"
      });
    }
    if (user.role != "office") {
      return res.status(401).json({
        message: "Only office can fetch reports without receipt number"
      });
    }
    let reports = null;
    reports = await Report.find({
      verified_flag: { $gte: 4 },
      receipt_no: { $in: [null, "", undefined] }
    });
    return res.status(200).json({
      message: "Reports fetched successfully",
      reports
    })
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error while fetching reports without receipt number",
      error: error
    });
  }
}

const fetchPoFile = async (req, res) => {
  try {
    const ref_no = req.params.ref_no;
    const report = await Report.findOne({ ref_no: ref_no });
    if (!report) {
      return res.status(404).json({
        message: "No reports found with given ref_no"
      })
    }
    return res.status(200).json({
      message: "PO File Fetched successfully",
      po_file_url: report.po_file_url
    })
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error while fetching PO file",
      error: error
    })
  }
}

const verifyReport = async (req, res) => {
  try {
    const ref_no = req.body.ref_no;
    if (!ref_no) {
      return res.status(404).json({
        message: "Reference Number required for rejection"
      })
    }
    const user_id = req.user_id;
    const user = await userSchema.findById(user_id);
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }


    const report = await Report.findOne({ ref_no: ref_no });


    if (user.role == "staff" || user.role == 'office') {
      return res.status(401).json({
        message: "Staffs/office doesn't have permission to verify the reports"
      })
    }
    if (!report) {
      return res.status(404).json({
        message: "Report not found"
      });
    }
    report.verified_flag += 1;
    if (user.role == "hod" && report.paid == false) {
      report.verified_flag += 1;
    }
    await report.save();

    return res.status(200).json({
      message: "Report verified successfully"
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server while verifying reports",
      error: err
    })
  }
}

const rejectReport = async (req, res) => {
  try {
    const user_id = req.user_id;
    const ref_no = req.body.ref_no;
    if (!ref_no) {
      return res.status(404).json({
        message: "Reference Number required for rejection"
      })
    }
    const user = await userSchema.findById(user_id);
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }
    if (user.role == "staff" || user.role == "office") {
      return res.status(401).json({
        message: "Staff/office can't reject any reports"
      })
    }

    const report = await Report.findOne({ ref_no: ref_no });
    if (!report) {
      return res.status(404).json({
        message: "Report not found"
      });
    }
    report.rejected_by = user.role;
    report.verified_flag = 0;
    await report.save();
    return res.status(200).json({
      message: "Report rejected successfully"
    })
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server error while rejecting report",
      error: err
    })
  }
}

const verifyPayment = async (req, res) => {
  try {
    const user_id = req.user_id;
    const ref_no = req.body.ref_no;
    if (!ref_no) {
      return res.status(404).json({
        message: "Reference Number required for verification"
      })
    }
    const user = await userSchema.findById(user_id);
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (user.role != "office") {
      return res.status(401).json({
        message: `${user.role} can't verify any reports`
      })
    }
    const report = await Report.findOne({ ref_no: ref_no });
    if (!report) {
      return res.status(404).json({
        message: "Report not found"
      });
    }

    report.paymentVerified = true;
    if (!report.receipt_no) {
      report.verified_flag += 1;
    }
    await report.save();

    return res.status(200).json({
      message: "Report verified successfully"
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server error while verifying payment",
      error: err
    })
  }
}

const rejectPayment = async (req, res) => {
  try {
    const user_id = req.user_id;
    const ref_no = req.body.ref_no;
    if (!ref_no) {
      return res.status(404).json({
        message: "Reference Number required for rejection"
      })
    }
    const user = await userSchema.findById(user_id);
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (user.role != "office") {
      console.log(`${user.role} trying to reject payments in report`);
      return res.status(401).json({
        message: `${user.role} can't reject any payments in reports`
      })
    }
    const report = await Report.findOne({ ref_no: ref_no });
    if (!report) {
      return res.status(404).json({
        message: "Report not found"
      });
    }
    report.rejected_by = user.role;
    report.paymentVerified = false;
    report.verified_flag = 0;

    await report.save();

    return res.status(200).json({
      message: "Report rejected successfully"
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server error while rejecting payment",
      error: err
    })
  }
}

const fetchReportById = async (req, res) => {
  try {
    const report_id = req.params.id;
    if (!report_id) {
      return res.status(404).json({
        message: "Report id is required"
      })
    }
    const report = await Report.findById(report_id);
    if (!report) {
      return res.status(404).json({
        message: "No reports with given report ID"
      });
    }
    return res.status(200).json({
      message: "Report fetched successfully",
      report
    })
  } catch (error) {

  }
}


const fetchReject = async (req, res) => {
  try {
    const reports = await Report.find({ rejected_by: { $ne: null } });

    if (!reports || reports.length === 0) {
      return res.status(404).json({
        message: "No rejected reports found"
      });
    }
    return res.status(200).json({
      message: "Rejected reports fetched successfully",
      reports
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error while fetching rejected reports",
      error: error.message
    });
  }
};

const updateRejectedReport = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user_id) {
      return res.status(401).json({
        message: "Unauthorized access"
      });
    }

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({
        message: "Report not found"
      });
    }

    // Check if report was actually rejected
    if (report.rejected_by === null) {
      return res.status(400).json({
        message: "This report was not rejected"
      });
    }

    // Update the report data from request body
    const updateData = req.body;

    // Reset rejection status
    updateData.rejected_by = null;
    updateData.verified_flag = 0; // Reset verification flag

    // Update the report
    const updatedReport = await Report.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    return res.status(200).json({
      message: "Report updated successfully",
      report: updatedReport
    });

  } catch (error) {
    return res.status(500).json({
      message: "Internal server error while updating report",
      error: error.message
    });
  }
};

const getUsername = async (req, res) => {
  try {
    const user_id = req.user_id;
    const user = await userSchema.findById(user_id);
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }
    const name = user.username;
    return res.status(200).json({
      message: "Fetched username successfully",
      username: name
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch username",
      error: error.message
    });
  }
}

const updateUsername = async (req, res) => {
  try {
    const user_id = req.user_id;
    const { username } = req.body;
    const name = username.username;
    console.log(name);
    const user = await userSchema.findById(user_id);
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }
    if (!name) {
      return res.status(400).json({
        message: "Username is required"
      });
    }
    user.username = name;
    await user.save();
    return res.status(200).json({
      message: "Username updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update username",
      error: error.message
    });
  }
}

const addReceiptNo = async (req, res) => {
  try {
    const user_id = req.user_id;
    const ref_no = req.body.ref_no;
    const receipt_no = req.body.receipt_no;
    const receipt_date = req.body.receipt_date;
    const bill_no = req.body.bill_no;
    const bill_date = req.body.bill_date;
    const user = await userSchema.findById(user_id);
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }
    if (!ref_no) {
      return res.status(404).json({
        message: "Reference Number required for adding receipt number"
      });
    }
    const report = await Report.findOne({ ref_no: ref_no });
    if (!report) {
      return res.status(404).json({
        message: "Report not found"
      });
    }
    if (!receipt_no) {
      return res.status(404).json({
        message: "Receipt Number required"
      });
    }
    if (!receipt_date) {
      return res.status(404).json({
        message: "Receipt date required"
      });
    }
    if (!bill_no) {
      return res.status(404).json({
        message: "Bill Number required"
      });
    }
    if (!bill_date) {
      return res.status(404).json({
        message: "Bill date required"
      });
    }
    if (user.role != "office") {
      return res.status(401).json({
        message: "Only office can add receipt number"
      });
    }
    report.receipt_no = receipt_no;
    report.receipt_date = receipt_date;
    report.bill_date = bill_date;
    report.bill_no = bill_no;
    await report.save();
    return res.status(200).json({
      message: "Receipt number and Bill number added successfully",
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      message: "Failed to add receipt number and bill number",
      error: error
    });
  }
}

const addPaymentDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user_id) {
      return res.status(401).json({
        message: "Unauthorized access"
      });
    }

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({
        message: "Report not found"
      });
    }


    // Update the report data from request body
    const { paid, payment_mode, transaction_details, transaction_date } = req.body;
    const paymentData = { paid, payment_mode, transaction_details, transaction_date };
    // Update the report
    const updatedReport = await Report.findByIdAndUpdate(
      id,
      paymentData,
      { new: true }
    );

    return res.status(200).json({
      message: "payment details added successfully",
      report: updatedReport
    });

  } catch (error) {
    return res.status(500).json({
      message: "Internal server error while adding payment details",
      error: error.message
    });
  }
};

const getUnpaidReports = async (req, res) => {
  try {
    const user_id = req.user_id;
    const user = await userSchema.findById(user_id);
    if (!user) {
      return res.status(401).json({
        message: "User not found"
      })
    }
    const dept = findDepartment(user.email);
    const reports = await Report.find({
      department: dept,
      rejected_by: { $in: [null, undefined] },
      paid: false,
      receipt_no: { $exists: true, $ne: null }
    });
    if (!reports) {
      return res.status(404).json({
        message: "No reports found for the user"
      });
    }
    return res.status(200).json({
      message: "Reports fetched successfully",
      reports
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error while fetching reports",
      error: error
    })
  }
}

const addLabs = async (req, res) => {
  try {
    const { department, labs } = req.body;

    if (!department) {
      return res.status(400).json({
        message: "Department name is required"
      });
    }

    if (!labs || !Array.isArray(labs) || labs.length === 0) {
      return res.status(400).json({
        message: "Labs array is required and must not be empty"
      });
    }

    // Check if department already exists
    let existingDepartment = await Lab.findOne({ department });

    if (existingDepartment) {
      // Update existing department with new labs
      // Use $addToSet to avoid duplicates
      existingDepartment = await Lab.findOneAndUpdate(
        { department },
        { $addToSet: { labs: { $each: labs } } },
        { new: true }
      );

      return res.status(200).json({
        message: "Labs added to existing department successfully",
        data: existingDepartment
      });
    } else {
      // Create new department with labs
      const newDepartment = new Lab({
        department,
        labs
      });

      await newDepartment.save();

      return res.status(201).json({
        message: "Department with labs created successfully",
        data: newDepartment
      });
    }
  } catch (error) {
    console.error("Error adding labs:", error);
    return res.status(500).json({
      message: "Internal server error while adding labs",
      error: error.message
    });
  }
};

const fetchLab = async(req,res) =>{
  try{
    const user_id = req.user_id;
    const user = await userSchema.findById(user_id);
    if (!user) {
      return res.status(401).json({
        message: "User not found"
      })
    }
    const dept = findDepartment(user.email);
    const lab = await Lab.findOne({department:dept});
    if (!lab){
      return res.status(401).json({
        message:"No labs for the user Department"
      })
    }
    return res.status(201).json({
      message:"Labs fetched successfully",
      labs : lab
    });
  }catch(error){
      res.status(500).json({
      message: "Internal Server Error while fetching reports",
      error: error
    })
  }
}

const fetchAllLabs = async(req,res)=>{
  try{
    const user_id = req.user_id;
    const user = await userSchema.findById(user_id);
    if (!user) {
      return res.status(401).json({
        message: "User not found"
      })
    }
    if(validateEmail(user.email) !== "dean"){
      return res.status(401).json({
        message: "Only dean can fetch all labs"
      })
    }
    const lab = await Lab.find();
    if (!lab){
      return res.status(404).json({
        message: "No labs available"
      })
    }
    return res.status(200).json({
      message : "Lab details fetched successfully",
      lab : lab
    });

  }catch(error){
    res.status(500).json({
      message: "Internal Server Error while fetching reports",
      error: error
    })
  }
}

const deleteLab = async (req, res) => {
  try {
    const { department, lab } = req.body;
    
    if (!department || !lab) {
      return res.status(400).json({
        message: "Department name and lab name are required"
      });
    }
    
    // Find the department
    const departmentDoc = await Lab.findOne({ department });
    
    if (!departmentDoc) {
      return res.status(404).json({
        message: "Department not found"
      });
    }
    
    // Check if lab exists in this department
    if (!departmentDoc.labs.includes(lab)) {
      return res.status(404).json({
        message: "Lab not found in this department"
      });
    }
    
    // Remove the lab
    departmentDoc.labs = departmentDoc.labs.filter(labName => labName !== lab);
    
    await departmentDoc.save();
    
    return res.status(200).json({
      message: "Lab deleted successfully",
      department: departmentDoc
    });
  } catch (error) {
    console.error("Error deleting lab:", error);
    return res.status(500).json({
      message: "Internal Server Error while deleting lab",
      error: error.message
    });
  }
};

const getDepartmentWiseCount = async (req,res) => {
  try{
    const department = req.params.dept;
    if (!department){
      return res.status(400).json({
        message : "Department is required"
      });
    }
    const count = await Report.countDocuments({department:department});
    return res.status(200).json({
      message : "count fetched successfully",
      count : count
    })
  }catch(error){
    res.status(500).json({message : "Error while fetching count",error:error.message});

  }
}
// Export the function
module.exports = {
  createReport,
  fetchReports,
  fetchAll,
  fetchReportsWithoutReceipt,
  fetchPoFile,
  verifyReport,
  rejectReport,
  verifyPayment,
  rejectPayment,
  fetchReportById,
  fetchReject,
  updateRejectedReport,
  getUsername,
  updateUsername,
  addReceiptNo,
  addPaymentDetails,
  getUnpaidReports,
  fetchLab,
  addLabs,
  fetchAllLabs,
  deleteLab,
  getDepartmentWiseCount
};
