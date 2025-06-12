const { Test,Lab } = require('../models/TestModel');
const UserSchema = require('../models/UserModel');
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
    const { title, unit, pricePerUnit, department,lab } = req.body;

    // Validate required fields
    if (!title || !unit || !pricePerUnit || !department) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const uppercaseLab = lab ? lab.toUpperCase() : lab;
    
    console.log(uppercaseLab);
    
    // Create new test
    const newTest = new Test({
      title,
      unit,
      pricePerUnit,
      department,
      lab: uppercaseLab,
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
    const { title, unit, pricePerUnit, department,lab } = req.body;

    // Validate required fields
    if (!title || !unit || !pricePerUnit || !department || !lab) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Find and update test
    const updatedTest = await Test.findByIdAndUpdate(
      id,
      { title, unit, pricePerUnit, department,lab },
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
    const lab = req.params.lab;
    const user_id = req.user_id;
    const user = await UserSchema.findById(user_id);
    if (!user){
      return res.status(404).json({message : "User not found"});

    }
    const dept = findDepartment(user.email);
    const departmentLabs = await Lab.findOne({department: dept});
    
    if (!departmentLabs) {
      return res.status(404).json({
        message: "No labs available for the user department"
      });
    }
    
    // Check if the requested lab exists in the available labs for this department
    if (lab && !departmentLabs.labs.includes(lab)) {
      return res.status(400).json({
        message: "The specified lab does not exist in your department",
        availableLabs: departmentLabs.labs
      });
    }

    const tests = await Test.find({ department: dept,lab : lab }).sort({ title: 1 });
    res.status(200).json({ message: 'Tests fetched successfully', tests });

  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tests by department' });
    console.log(error);
  }
}

const fetchLabByDepartment = async(req,res) =>{
  try{
    console.log(req.body)
    const {department}= req.body;
    console.log(department);
    if (!department){
      return res.status(401).json({
        message : "Department name is reqiured"
      })
    }
    const lab = await Lab.findOne({department:department});
    if (!lab){
      return res.status(401).json({
        message : "No records found for the given department"
      });
    }
    return res.status(200).json({
      message : "Labs fetched succefully",
      lab : lab.labs
    })
  }catch(error){
    res.status(500).json({ message: 'Failed to fetch tests by department' });
    console.log(error);
  }
}

module.exports = {
  fetchAll,
  addTest,
  updateTest,
  deleteTest,
  fetchByDepartment,
  fetchLabByDepartment
}
