
const userSchema = require("../models/UserModel");
const {
  Report,
  Test
} = require("../models/TestModel");
const { report } = require("../routes/userRoutes");
const {
  flag,
  findDepartment
} = require("../utils/reportUtils");
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
    const report = new Report({
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
          verified_flag: 0
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
      reports = await Report.find({
        department: dept,
      });
    } else if (user.role == "office") {
      console.log('In fetchreports');
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
      console.log('Reports:', reports);
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
      console.log(`${user.role} trying to verify report`);
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
    report.verified_flag += 1;
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
    const new_username = req.body.username;
    const user = await userSchema.findById(user_id);
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }
    if (!new_username) {
      return res.status(400).json({
        message: "Username is required"
      });
    }
    user.username = new_username.username;
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
    const user = await userSchema.findById(user_id);
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }
    if (!ref_no) {
      return res.status(404).json({
        message: "Reference Number required for rejection"
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
        message: "Receipt Date required"
      });
    }
    if (user.role != "office") {
      return res.status(401).json({
        message: "Only office can add receipt number"
      });
    }
    report.receipt_no = receipt_no;
    report.receipt_date = receipt_date;
    await report.save();
    return res.status(200).json({
      message: "Receipt number and date added successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to add receipt number",
      error: error.message
    });
  }
}

// Export the function
module.exports = {
  createReport,
  fetchReports,
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
  addReceiptNo
};
