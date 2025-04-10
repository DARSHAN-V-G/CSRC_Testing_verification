const jwt = require('jsonwebtoken');
require('dotenv').config();
const UserModel = require('../models/UserModel');
const bcrypt = require('bcryptjs');
const {
  generateAccessToken,
  generateRefreshToken
} = require('../utils/userUtils');

const registerController = async (req, res) => {
  const user = req.body;
  try {
    if (!user.email || !user.password) {
      return res.status(400).json({
        message: 'All fields are required'
      });
    }

    const existingUser = await UserModel.findOne({ email: user.email });
    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser = new UserModel({
      email: user.email,
      password: hashedPassword,
      role: 'temp'
    });

    await newUser.save();

    const accesstoken = generateAccessToken(newUser._id);
    const refreshtoken = generateRefreshToken(newUser._id);
    res.cookie('accesstoken', accesstoken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    });
    res.cookie('refreshtoken', refreshtoken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    });
    return res.status(201).json({
      message: 'User signed up successfully'
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
}

const loginController = async (req, res) => {
  const user = req.body;
  try {
    const checkUser = await UserModel.findOne({ email: user.email });
    if (!checkUser) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    const isPasswordValid = await bcrypt.compare(user.password, checkUser.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid password'
      });
    }

    const accesstoken = generateAccessToken(checkUser._id);
    const refreshtoken = generateRefreshToken(checkUser._id);
    res.cookie('accesstoken', accesstoken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    });
    res.cookie('refreshtoken', refreshtoken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    });
    return res.status(201).json({
      message: 'User logged in successfully'
    });

  } catch (err) {
    return res.status(500).json({
      message: 'Failed login'
    })
  }
}

const logoutController = async (req, res) => {
  res.clearCookie('accesstoken', {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
  });
  res.clearCookie('refreshtoken', {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
  });
  return res.status(201).json({
    message: 'User logged out successfully'
  });
}

module.exports = {
  registerController,
  loginController,
  logoutController,
  generateSecurityCodeController,
  verifySecurityCodeController,
  resetPasswordController,
  getNewAccessTokenController
}
