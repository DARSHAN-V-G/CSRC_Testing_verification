const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

const userAuthMiddleware = (req, res, next) => {
  try {
    const token = req.cookies?.accesstoken;
    if (!token) {
      return res.status(401).json({
        message: 'No token provided in middleware'
      });
    }
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET);
    if (typeof decoded === 'object' && 'id' in decoded) {
      req.user_id = decoded.id;
    } else {
      return res.status(401).json({
        message: 'Invalid token payload'
      });
    }
    next();
  } catch (err) {
    return res.status(401).json({
      message: 'Invalid token'
    });
  }
}

module.exports = { userAuthMiddleware };
