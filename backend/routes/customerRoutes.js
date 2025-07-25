const express = require('express');
const router = express.Router();
const {
    createCustomer,
    getCustomer
} = require ("../controllers/customerController");
router.post('/create',createCustomer);
router.get('/details/:dept',getCustomer);

module.exports = router;
