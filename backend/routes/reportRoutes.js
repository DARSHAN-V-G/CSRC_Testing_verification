const express = require("express");
const multer = require("multer");
const { storage } = require("../config/cloudinary");
const upload = multer({ storage });
const {
    createReport,
    fetchReports,
    fetchPoFile,
    verifyReport,
    rejectReport
} = require("../controllers/reportController");
const {
    generateReport
} = require("../controllers/generateReportController");
const router = express.Router();

router.post('/create',upload.single("file"),createReport);
// body is the reportSchema
router.get('/fetch/:verified',fetchReports);
// params should include the variable , verified = true or false
//verified = true, fetch the reports those are verified by the respective user and vice verse for verified = talse
router.get('/generate/:ref_no',generateReport);
router.post('/verify',verifyReport);
//body has the ref_no
router.post('/reject',rejectReport);
//router.get('/fetch/po_file/:ref_no',fetchPoFile);

module.exports = router;