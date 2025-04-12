const express = require("express");
const multer = require("multer");
const { storage } = require("../config/cloudinary");
const upload = multer({ storage });
const {
    createReport,
    fetchReports
} = require("../controllers/reportController");

const router = express.Router();

router.post('/create',upload.single("file"),createReport);
router.get('/fetch',fetchReports);

module.exports = router;