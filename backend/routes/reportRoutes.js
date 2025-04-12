const express = require("express");
const multer = require("multer");
const { storage } = require("../config/cloudinary");
const upload = multer({ storage });
const {
    createReport,
    fetchReports,
    fetchPoFile
} = require("../controllers/reportController");

const router = express.Router();

router.post('/create',upload.single("file"),createReport);
router.get('/fetch',fetchReports);
router.get('/fetch/po_file/:ref_no',fetchPoFile);
module.exports = router;