const express = require("express");
const multer = require("multer");
const { storage } = require("../config/cloudinary");
const upload = multer({ storage });
const {
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
  getUnpaidReports
} = require("../controllers/reportController");
const {
  generateReport
} = require("../controllers/generateReportController");

const { userAuthMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();
router.get('/fetchRejected', fetchReject);
router.post('/create', upload.single("po_file"), createReport);
// body is the reportSchema
router.get('/fetch/:verified', fetchReports);
router.get('/fetchAll', fetchAll);
router.get('/fetchWithoutReceipt', fetchReportsWithoutReceipt);
// params should include the variable , verified = true or false
//verified = true, fetch the reports those are verified by the respective user and vice verse for verified = talse
router.get('/generate/:ref_no', generateReport);
router.post('/verify', verifyReport);
//body has the ref_no
router.post('/reject', rejectReport);
router.get('/getusername', getUsername);
router.post('/updateusername', updateUsername);

router.put('/update-rejected/:id', updateRejectedReport);
router.post('/verify_payment', verifyPayment);
router.post('/reject_payment', rejectPayment);
router.post('/add_receipt_no', addReceiptNo);
router.put('/:id/payment', addPaymentDetails);

router.get('/unpaidreports', getUnpaidReports);

router.get('/:id', fetchReportById);

module.exports = router;
