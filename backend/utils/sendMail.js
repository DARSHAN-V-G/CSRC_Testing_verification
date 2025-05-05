const nodemailer = require('nodemailer');
require('dotenv').config();

const SENDER_EMAIL = process.env.SENDER_EMAIL;
const SENDER_PASSWORD = process.env.SENDER_PASSWORD;

const sendSecurityCodeEmail = (to, code) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // use TLS
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
    } else {
      console.log('Email sent:', info.response);
    }
  });
}

module.exports = {
  sendSecurityCodeEmail
};
