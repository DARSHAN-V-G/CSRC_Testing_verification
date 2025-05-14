const nodemailer = require('nodemailer');
require('dotenv').config();

const SENDER_EMAIL = process.env.SENDER_EMAIL;
const SENDER_PASSWORD = process.env.SENDER_PASSWORD;

const sendSecurityCodeEmail = (to, code) => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: SENDER_EMAIL,
        pass: SENDER_PASSWORD
      }
    });

    const mailOptions = {
      from: SENDER_EMAIL,
      to: to,
      subject: 'CSRC Password Recovery',
      text: `Your security code is ${code}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return reject(error);
      } else {
        console.log('Email sent:', info.response);
        return resolve(info);
      }
    });
  });
};

module.exports = {
  sendSecurityCodeEmail
};
