const express = require('express');
const {
  registerController,
  loginController,
  logoutController,
  generateSecurityCodeController,
  verifySecurityCodeController,
  resetPasswordController,
  getNewAccessTokenController
} = require('../controllers/userController');
const router = express.Router();

router.post('/register', registerController);
router.post('/login', loginController);
router.post('/logout', logoutController);
router.post('/generatecode', generateSecurityCodeController);
router.post('/verifycode', verifySecurityCodeController);
router.post('/resetpassword', resetPasswordController);
router.post('/getnewaccesstoken', getNewAccessTokenController);

module.exports = router;
