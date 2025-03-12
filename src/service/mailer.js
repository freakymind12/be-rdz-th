const nodemailer = require("nodemailer");

const mailService = {
  // Make Configuration for mailer
  transporter: nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      type: "login",
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  }),

  // Send Email
  sendEmail: async (mailOptions, attachments = []) => {
    const { to, subject, text, html } = mailOptions;
    try {
      await mailService.transporter.sendMail({
        from: `"IoT System HRS ID" <${process.env.MAIL_USER}>`,
        to,
        subject,
        text,
        html,
        attachments,
      });
    } catch (error) {
      console.error(`Error sending email:`, error);
    }
  },
};

module.exports = mailService;
