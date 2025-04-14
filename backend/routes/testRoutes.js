const express = require('express');
const router = express.Router();
const {
    fetchAll,
    addTest,
    updateTest,
    deleteTest
} = require("../controllers/testController");



// Get all tests
router.get('/all', fetchAll);

// Add a new test
router.post('/add', addTest);

// Update a test
router.put('/update/:id', updateTest);

// Delete a test
router.delete('/delete/:id', deleteTest);

module.exports = router;