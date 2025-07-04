const express = require('express');
const router = express.Router();
const {
  fetchAll,
  addTest,
  updateTest,
  deleteTest,
  fetchByDepartment,
  fetchLabByDepartment
} = require("../controllers/testController");



// Get all tests
router.get('/all', fetchAll);
router.post('/fetchLabByDepartment',fetchLabByDepartment);
router.get('/department/:lab', fetchByDepartment);

// Add a new test
router.post('/add', addTest);

// Update a test
router.put('/update/:id', updateTest);

// Delete a test
router.delete('/delete/:id', deleteTest);

module.exports = router;
