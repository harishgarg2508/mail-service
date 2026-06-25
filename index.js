require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and body parsers
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // Use connection pooling for efficiency
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
});

let isSmtpHealthy = false;

// Verify SMTP connection on startup
const verifySmtpConnection = async () => {
  try {
    await transporter.verify();
    isSmtpHealthy = true;
    console.log('✅ SMTP connection established successfully.');
  } catch (error) {
    isSmtpHealthy = false;
    console.error('❌ SMTP connection validation failed:', error.message);
  }
};

verifySmtpConnection();

/**
 * Utility function to render an EJS template
 * @param {string} templateName - Name of the template (without extension)
 * @param {object} context - Variables passed to EJS template
 * @returns {Promise<string>} Rendered HTML string
 */
const renderEmailTemplate = (templateName, context = {}) => {
  return new Promise((resolve, reject) => {
    const templatePath = path.join(__dirname, 'templates', `${templateName}.ejs`);
    
    if (!fs.existsSync(templatePath)) {
      return reject(new Error(`Template '${templateName}.ejs' not found in templates directory.`));
    }
    
    ejs.renderFile(templatePath, context, (err, html) => {
      if (err) {
        return reject(err);
      }
      resolve(html);
    });
  });
};

// Health check endpoint
app.get('/health', async (req, res) => {
  // Re-verify connection asynchronously in background to keep status fresh
  transporter.verify()
    .then(() => { isSmtpHealthy = true; })
    .catch(() => { isSmtpHealthy = false; });

  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    smtp: {
      connected: isSmtpHealthy,
      host: process.env.SMTP_HOST || 'not configured',
      port: process.env.SMTP_PORT || 'not configured'
    }
  });
});

// Root endpoint redirect/info
app.get('/', (req, res) => {
  res.json({
    service: 'FutureBot SMTP Mail Service',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      sendEmail: 'POST /api/send-email'
    }
  });
});

// Route to send email
app.post('/api/send-email', async (req, res, next) => {
  const { to, subject, text, html, template, context, from, attachments } = req.body;

  // Input validation
  if (!to) {
    return res.status(400).json({ error: "Missing required parameter: 'to'" });
  }
  if (!subject) {
    return res.status(400).json({ error: "Missing required parameter: 'subject'" });
  }

  try {
    let mailHtml = html;

    // If template is specified, compile EJS template
    if (template) {
      try {
        mailHtml = await renderEmailTemplate(template, context || {});
      } catch (templateError) {
        return res.status(400).json({
          error: `Failed to render EJS template: ${templateError.message}`
        });
      }
    }

    // Build the mail options
    const mailOptions = {
      from: from || process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
      to,
      subject,
      text,
      html: mailHtml,
      attachments: attachments || [],
    };

    // Ensure we have at least one body format
    if (!mailOptions.text && !mailOptions.html) {
      return res.status(400).json({
        error: "Either 'text', 'html', or a valid 'template' must be provided to send an email."
      });
    }

    // Send the mail
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`Email sent successfully: ${info.messageId}`);
    
    return res.status(200).json({
      success: true,
      messageId: info.messageId,
      response: info.response
    });
  } catch (error) {
    console.error('Failed to send email:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to send email',
      details: error.message
    });
  }
});

// Route to send onboarding welcome email specifically
app.post('/api/send-welcome', async (req, res, next) => {
  const { email, name, actionUrl, attachments } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Missing required parameter: 'email'" });
  }
  if (!name) {
    return res.status(400).json({ error: "Missing required parameter: 'name'" });
  }

  try {
    const mailHtml = await renderEmailTemplate('karma_welcome', {
      name,
      actionUrl: actionUrl || 'https://astrofinix.com'
    });

    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
      to: email,
      subject: '🎁 Welcome! 25 Karma Coins Have Been Added to Your Wallet',
      html: mailHtml,
      attachments: attachments || [],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email} successfully: ${info.messageId}`);
    
    return res.status(200).json({
      success: true,
      messageId: info.messageId,
      response: info.response
    });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to send welcome email',
      details: error.message
    });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mail service listening on port ${PORT}`);
});
