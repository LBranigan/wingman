const nodemailer = require('nodemailer');

// Create transporter using environment variables
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Send partner recruitment invitation email
const sendPartnerInvitation = async (recipientEmail, inviterName, invitationToken) => {
  const transporter = createTransporter();

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const invitationUrl = `${frontendUrl}/register?inviteToken=${invitationToken}`;

  const mailOptions = {
    from: `"Wingman" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: `${inviterName} wants you as their Wingman partner!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            padding: 15px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>You've Been Invited to Wingman!</h1>
          </div>
          <div class="content">
            <p>Hi there!</p>

            <p><strong>${inviterName}</strong> wants you to be their accountability partner on Wingman.</p>

            <p>Wingman is a weekly goal-tracking app where partners support each other to stay motivated and achieve their goals together.</p>

            <p>As partners, you'll be able to:</p>
            <ul>
              <li>Share your weekly goals with each other</li>
              <li>Provide encouraging comments and feedback</li>
              <li>Track progress together</li>
              <li>Stay accountable to your commitments</li>
            </ul>

            <p>Click the button below to join and automatically become partners with ${inviterName}:</p>

            <div style="text-align: center;">
              <a href="${invitationUrl}" class="button">Accept Invitation & Join Wingman</a>
            </div>

            <p style="margin-top: 20px; font-size: 12px; color: #666;">
              Or copy and paste this link into your browser:<br>
              <a href="${invitationUrl}">${invitationUrl}</a>
            </p>

            <p>Looking forward to seeing you achieve great things together!</p>

            <p>- The Wingman Team</p>
          </div>
          <div class="footer">
            <p>This invitation was sent by ${inviterName} through Wingman.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Hi there!

${inviterName} wants you to be their accountability partner on Wingman.

Wingman is a weekly goal-tracking app where partners support each other to stay motivated and achieve their goals together.

Click the link below to join and automatically become partners with ${inviterName}:
${invitationUrl}

Looking forward to seeing you achieve great things together!

- The Wingman Team
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Partner invitation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending partner invitation email:', error);
    throw new Error('Failed to send invitation email');
  }
};

// Send password reset email
const sendPasswordResetEmail = async (recipientEmail, resetToken, userName) => {
  const transporter = createTransporter();

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"Wingman" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: 'Reset Your Wingman Password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            padding: 15px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>

            <p>We received a request to reset your password for your Wingman account.</p>

            <p>Click the button below to reset your password:</p>

            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>

            <p style="margin-top: 20px; font-size: 12px; color: #666;">
              Or copy and paste this link into your browser:<br>
              <a href="${resetUrl}">${resetUrl}</a>
            </p>

            <div class="warning">
              <strong>⚠️ Important:</strong>
              <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>This link will expire in <strong>1 hour</strong></li>
                <li>If you didn't request this, you can safely ignore this email</li>
                <li>Your password will not be changed until you create a new one</li>
              </ul>
            </div>

            <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>

            <p>Best regards,<br>The Wingman Team</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Hi ${userName},

We received a request to reset your password for your Wingman account.

Click the link below to reset your password:
${resetUrl}

⚠️ Important:
- This link will expire in 1 hour
- If you didn't request this, you can safely ignore this email
- Your password will not be changed until you create a new one

If you didn't request a password reset, please ignore this email.

Best regards,
The Wingman Team
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

module.exports = {
  sendPartnerInvitation,
  sendPasswordResetEmail,
};
