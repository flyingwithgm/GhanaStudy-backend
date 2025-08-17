const nodemailer = require('nodemailer');
require('dotenv').config();

const createTransporter = () => {
  const config = {
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  };

  if (process.env.EMAIL_SERVICE === 'gmail') {
    config.auth = {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    };
  }

  return nodemailer.createTransporter(config);
};

const emailTemplates = {
  welcome: (name) => ({
    subject: 'Welcome to GhanaStudy! 🎓',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border: 1px solid #eee; }
          .footer { background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
          .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to GhanaStudy!</h1>
          </div>
          <div class="content">
            <h2>Hello ${name}! 👋</h2>
            <p>We're excited to have you join our learning community in Ghana.</p>
            <p>GhanaStudy is your platform for:</p>
            <ul>
              <li>📚 Asking and answering academic questions</li>
              <li>👥 Joining study groups with fellow students</li>
              <li>📖 Accessing past examination papers</li>
              <li>🧠 Getting AI-powered study assistance</li>
              <li>🎯 Tracking your learning progress</li>
            </ul>
            <p>Start exploring and boost your grades today!</p>
            <a href="https://flyingwithgm.github.io/GhanaStudy" class="button">Start Learning</a>
          </div>
          <div class="footer">
            <p>© 2024 GhanaStudy. All rights reserved.</p>
            <p>This is an automated message. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

const sendEmail = async (to, template, data = {}) => {
  try {
    const transporter = createTransporter();
    
    const emailContent = emailTemplates[template](data);
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: to,
      subject: emailContent.subject,
      html: emailContent.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent successfully to:', to);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    return { success: false, error: error.message };
  }
};

const sendWelcomeEmail = async (email, name) => {
  return await sendEmail(email, 'welcome', name);
};

const testEmailService = async () => {
  try {
    console.log('📧 Testing Email Service...');
    console.log('📋 Email Configuration:');
    console.log('   Service:', process.env.EMAIL_SERVICE || 'gmail');
    console.log('   User:', process.env.EMAIL_USER ? '***@***.com' : 'Not set');
    console.log('   From:', process.env.EMAIL_FROM || process.env.EMAIL_USER);
    
    const transporter = createTransporter();
    console.log('✅ Transporter created successfully');
    
    console.log('🎉 Email service is ready!');
    console.log('ℹ️  Note: Actual email sending requires valid credentials');
    
  } catch (error) {
    console.error('❌ Email service test failed:', error.message);
  }
};

module.exports = {
  sendWelcomeEmail,
  testEmailService
};
