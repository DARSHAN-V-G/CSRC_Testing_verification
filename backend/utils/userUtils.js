const jwt = require('jsonwebtoken');
require('dotenv').config();


const JWT_ACCESS_SECRET = process.env.JWT_ACESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_ACCESS_EXPIRATION = process.env.JWT_ACCESS_EXPIRATION;
const JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION;

const validateEmail = (email) => {
  //to be done
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

module.exports = {
  generateAccessToken,
  generateRefreshToken
}
