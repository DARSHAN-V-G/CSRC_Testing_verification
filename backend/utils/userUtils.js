const jwt = require('jsonwebtoken');
require('dotenv').config();


const JWT_ACCESS_SECRET = process.env.JWT_ACESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_ACCESS_EXPIRATION = process.env.JWT_ACCESS_EXPIRATION;
const JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION;

const validateEmail = (email) => {
  email = email.toLowerCase();
  if (email.startsWith('dept.')) { return "staff"; }
  if (email.startsWith('hod.') || email.startsWith('director')) { return "hod"; }
  if (email.startsWith('spk.civil')) { return 'faculty'; }
  if (email.startsWith('csrc')) { return 'office'; }
  if (email.startsWith('dean.')) { return 'dean'; }
  return 'invalid';
}


const generateAccessToken = (id) => {
  const token = jwt.sign(
    { id: id },
    JWT_ACCESS_SECRET,
    { expiresIn: 60 * parseInt(JWT_ACCESS_EXPIRATION) }
  );
  return token;
}

const generateRefreshToken = (id) => {
  const token = jwt.sign(
    { id: id },
    JWT_REFRESH_SECRET,
    { expiresIn: 60 * parseInt(JWT_REFRESH_EXPIRATION) }
  );
  return token;
}

const generateSecurityCode = () => {
  const alphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const length = 3;
  let code = '';
  for (let i = 0; i < length; i++) {
    code += alphabets[Math.floor(Math.random() * alphabets.length)] + numbers[Math.floor(Math.random() * numbers.length)]
  }
  return code;
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateSecurityCode,
  validateEmail
}
