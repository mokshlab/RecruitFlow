// backend/controllers/contactController.js

const axios = require('axios');
const logger = require('../config/logger');
const { asyncHandler, APIError } = require('../middleware/errorMiddleware');

exports.sendContactEmail = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;

  // If email service is not configured, just log the message and return success
  if (!process.env.RESEND_API_KEY) {
    logger.info(`Contact form submitted by ${email} (email service not configured): ${message.substring(0, 100)}`);
    return res.json({ 
      success: true, 
      message: 'Thank you for contacting us! We have received your message and will get back to you soon.' 
    });
  }

  try {
    const emailData = {
      from: 'onboarding@resend.dev',
      to: process.env.CONTACT_EMAIL || 'solutionsbymoksh@gmail.com',
      subject: `Contact Form: Message from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    };

    await axios.post('https://api.resend.com/emails', emailData, {
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    logger.info(`Contact form submitted by ${email} - Email sent successfully`);
  } catch (emailError) {
    // Email failed, but don't break the user experience
    logger.error(`Failed to send email for contact from ${email}:`, emailError.message);
  }

  res.json({ success: true, message: 'Thank you for contacting us! We have received your message and will get back to you soon.' });
});

module.exports = exports;
