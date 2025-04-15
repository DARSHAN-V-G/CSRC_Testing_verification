const express = require('express');
const { userAuthMiddleware } = require("../middlewares/authMiddleware");
const {
  checkStatus,
  registerController,
  loginController,
  logoutController,
  generateSecurityCodeController,
  verifySecurityCodeController,
  resetPasswordController,
  getNewAccessTokenController,
  verifyRegisterSecurityCodeController
} = require('../controllers/userController');
const router = express.Router();
router.get('/status', userAuthMiddleware, checkStatus);
router.post('/register', registerController);
router.post('/register/verify', verifyRegisterSecurityCodeController);
router.post('/login', loginController);
router.post('/logout', logoutController);
router.post('/generatecode', generateSecurityCodeController);
router.post('/verifycode', verifySecurityCodeController);
router.post('/resetpassword', resetPasswordController);
router.post('/getnewaccesstoken', getNewAccessTokenController);

module.exports = router;
