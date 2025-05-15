const { Test } = require('../models/TestModel');
const UserModel = require('../models/UserModel');
const { findDepartment } = require('../utils/reportUtils');

const fetchAll = async (req, res) => {
  try {
    const tests = await Test.find().sort({ createdAt: -1 });
    res.status(200).json({ message: 'Tests fetched successfully', tests });
  } catch (error) {
    console.error('Error fetching tests:', error);
    res.status(500).json({ message: 'Failed to fetch tests' });
  }
}

const addTest = async (req, res) => {
  try {
    const { title, unit, pricePerUnit, department } = req.body;

    // Validate required fields
    if (!title || !unit || !pricePerUnit || !department) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Create new test
    const newTest = new Test({
      title,
      unit,
      pricePerUnit,
      department,
      quantity: null
    });

    // Save to database
    const savedTest = await newTest.save();

    res.status(201).json({
      message: 'Test added successfully',
      test: savedTest
    });

  } catch (error) {
    console.error('Error adding test:', error);
    res.status(500).json({ message: 'Failed to add test' });
  }
}

const updateTest = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, unit, pricePerUnit, department } = req.body;

    // Validate required fields
    if (!title || !unit || !pricePerUnit || !department) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Find and update test
    const updatedTest = await Test.findByIdAndUpdate(
      id,
      { title, unit, pricePerUnit, department },
      { new: true } // Return the updated document
    );

    if (!updatedTest) {
      return res.status(404).json({ message: 'Test not found' });
    }

    res.status(200).json({
      message: 'Test updated successfully',
      test: updatedTest
    });

  } catch (error) {
    console.error('Error updating test:', error);
    res.status(500).json({ message: 'Failed to update test' });
  }
};

const deleteTest = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete test
    const deletedTest = await Test.findByIdAndDelete(id);

    if (!deletedTest) {
      return res.status(404).json({ message: 'Test not found' });
    }

    res.status(200).json({
      message: 'Test deleted successfully',
      testId: id
    });

  } catch (error) {
    console.error('Error deleting test:', error);
    res.status(500).json({ message: 'Failed to delete test' });
  }
};

const fetchByDepartment = async (req, res) => {
  try {
    const user_id = req.user_id;
    const user = await UserModel.findById(user_id);
    const dept = findDepartment(user.email);

    const tests = await Test.find({ department: dept }).sort({ title: 1 });
    res.status(200).json({ message: 'Tests fetched successfully', tests });

  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tests by department' });
  }
}

module.exports = {
  fetchAll,
  addTest,
  updateTest,
  deleteTest,
  fetchByDepartment
}
