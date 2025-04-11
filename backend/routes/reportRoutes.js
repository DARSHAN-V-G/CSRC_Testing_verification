const express = require("express");
const multer = require("multer");
const { storage } = require("../config/cloudinary");
const upload = multer({ storage });
const {
    createReport
} = require("../controllers/reportController");

const router = express.Router();

router.post('/create',upload.single("file"),createReport);


module.exports = router;