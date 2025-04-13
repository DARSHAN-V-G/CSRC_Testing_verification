const jwt = require('jsonwebtoken');
require('dotenv').config();
const UserModel = require('../models/UserModel');
const UserSecurityCodeModel = require('../models/UserSecurityCodeModel');
const { sendSecurityCodeEmail } = require('../utils/sendMail');
const bcrypt = require('bcryptjs');
const {
  generateAccessToken,
  generateRefreshToken,
  generateSecurityCode,
  validateEmail
} = require('../utils/userUtils');

const ONE_HOUR = 60 * 60 * 1000;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

const checkStatus = async(req,res)=>{
  return res.status(200).json({
    message:"The token is still valid"
  })
}

const registerController = async (req, res) => {
  const user = req.body;
  try {
    if (!user.email || !user.password) {
      return res.status(400).json({
        message: 'All fields are required'
      });
    }

    const existingUser = await UserModel.findOne({ email: user.email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);
    const role = validateEmail(user.email.toLowerCase());
    if (role == 'invalid') {
      return res.status(401).json({
        message: "Invalid "
      })
    }
    const newUser = new UserModel({
      email: user.email.toLowerCase(),
      password: hashedPassword,
      role: role,
      isVerified: false
    });

    await newUser.save();

    const code = generateSecurityCode();
    const newSecurityRecord = new UserSecurityCodeModel({
      user_id: newUser._id,
      code: code,
      updatedAt: new Date()
    });
    await newSecurityRecord.save();
    sendSecurityCodeEmail(user.email.toLowerCase(), code);

    return res.status(201).json({
      message: 'verification code sent to your email. Please verifiy to complete sign up',
      user: newUser
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
    const checkUser = await UserModel.findOne({ email: user.email.toLowerCase() });
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
    const isVerified = user.isVerified;
    if (isVerified) {
      return res.status(401).json({
        message: 'User not verified'
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
      message: 'User logged in successfully',
      user: checkUser
    });

  } catch (err) {
    return res.status(500).json({
      message: 'Failed login'
    })
  }
}

const logoutController = async (req, res) => {
  try {
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
  } catch (err) {
    return res.status(500).json({
      message: 'Failed to logout'
    });
  }
}

const generateSecurityCodeController = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    const user_id = user._id;
    const code = generateSecurityCode();
    const userSecurityRecord = await UserSecurityCodeModel.findOne({ user_id });
    if (!userSecurityRecord) {
      const newUserSecurityCode = new UserSecurityCodeModel({
        user_id: user_id,
        code: code
      });
      await newUserSecurityCode.save();
    } else {
      userSecurityRecord.code = code;
      userSecurityRecord.updatedAt = new Date();
      await userSecurityRecord.save();
    }
    sendSecurityCodeEmail(email, code);
    return res.status(200).json({
      message: 'Security code created and mailed successfully'
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Failed to generate security code'
    });
  }
}

const verifySecurityCodeController = async (req, res) => {
  const { email, code } = req.body;
  try {
    const userRecord = await UserModel.findOne({ email: email.toLowerCase() });
    if (!userRecord) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    const user_id = userRecord._id;
    const securityRecord = await UserSecurityCodeModel.findOne({ user_id: user_id });
    if (!securityRecord) {
      return res.status(404).json({
        message: 'Security code not found'
      });
    }

    const NOW = Date.now();
    const THEN = securityRecord.updatedAt.getTime();
    if (NOW - THEN > ONE_HOUR) {
      return res.status(400).json({
        message: 'Security code expired'
      });
    }

    const security_code = securityRecord.code;
    if (security_code === code) {
      return res.status(200).json({
        message: 'Security code verified successfully'
      });
    } else {
      return res.status(400).json({
        message: 'Invalid security code'
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: 'Failed to verify security code'
    });
  }
}

const resetPasswordController = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userRecord = await UserModel.findOne({ email: email.toLowerCase() });
    if (!userRecord) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    const hasshedPassword = await bcrypt.hash(password, 10);
    userRecord.password = hasshedPassword;
    await userRecord.save();
    return res.status(200).json({
      message: 'Password reset successfully'
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Failed to reset password'
    });
  }
}

const getNewAccessTokenController = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshtoken;
    const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const user_id = typeof payload === 'object' && 'id' in payload ? payload.id : null;
    if (!user_id) {
      return res.status(400).json({
        message: 'Invalid token payload'
      });
    }
    const accesstoken = generateAccessToken(user_id);
    const refreshtoken = generateRefreshToken(user_id);
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
      message: 'Failed to get new access token'
    });
  }
}

const verifyRegisterSecurityCodeController = async (req, res) => {
  const { email, code } = req.body;
  try {
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "User already verified"
      });
    }

    const user_id = user._id;
    const securityRecord = await UserSecurityCodeModel.findOne({ user_id: user_id });
    if (!securityRecord) {
      return res.status(404).json({
        message: "Security code not found"
      });
    }

    if (securityRecord.code !== code) {
      return res.status(400).json({
        message: "Invalid security code"
      });
    }

    user.isVerified = true;
    await user.save();
    const accesstoken = generateAccessToken(user._id);
    const refreshtoken = generateRefreshToken(user._id);
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

    return res.status(200).json({
      message: 'User verified and signed in successfully'
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Failed to verify security code for sign up'
    });
  }
}

module.exports = {
  checkStatus,
  registerController,
  loginController,
  logoutController,
  generateSecurityCodeController,
  verifySecurityCodeController,
  resetPasswordController,
  getNewAccessTokenController,
  verifyRegisterSecurityCodeController
};
