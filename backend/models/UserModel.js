const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
}, { timestamps: true });

module.exports = mongoose.model('UserModel', UserSchema);
