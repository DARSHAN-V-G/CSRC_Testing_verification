const jwt = require('jsonwebtoken');
require('dotenv').config();


const JWT_ACCESS_SECRET = process.env.JWT_ACESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_ACCESS_EXPIRATION = process.env.JWT_ACCESS_EXPIRATION;
const JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION;

const validateEmail = (email) => {
  //to be done
}

const determineRoleFromEmail = (email) => {
  if (!email) return 'temp';
  if (email == 'spk.civil@psgtech.ac.in'){
    return 'faculty'
  }
  email = email.toLowerCase();
  
  const localPart = email.split('@')[0];
  
  if (localPart.includes('.')) {
    const firstPart = localPart.split('.')[0];
    
    if (firstPart === 'hod') {
      return 'hod';
    } else if (firstPart === 'dean') {
      return 'dean';
    } else if (firstPart === 'dept') {
      return 'staff';
    }
  }
  if(localPart=="csrc"){
    return 'office'
  }
  
  return 'temp';
};

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
  const length = 6;
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
  determineRoleFromEmail
}
