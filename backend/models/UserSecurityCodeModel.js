const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSecurityCodeSchema = new Schema({
  user_id: {
    type: String,
    required: true
  },
  code: {
    type: String
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('UserSecurityCodeModel', UserSecurityCodeSchema);
