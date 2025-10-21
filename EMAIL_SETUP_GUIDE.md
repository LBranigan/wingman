# Email Setup Guide for Wingman Partner Invitations

## Problem
The "Reach Out to a Friend" feature stores the invitation in the database but doesn't actually send emails because the email credentials are not configured.

## Solution

You need to configure email settings in the `.env` file. Here are your options:

---

## Option 1: Gmail (Recommended for Testing)

### Steps:

1. **Use a Gmail Account** (or create a new one for the app)

2. **Enable 2-Step Verification**
   - Go to https://myaccount.google.com/security
   - Enable "2-Step Verification"

3. **Create an App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "Wingman App"
   - Click "Generate"
   - Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)

4. **Update `.env` file**

Open `backend/.env` and replace:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

With your actual credentials:

```env
EMAIL_USER=youremail@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
```

(Remove spaces from the app password)

5. **Restart the backend server**

```bash
# Stop the current server (Ctrl+C in the terminal)
cd backend
npm start
```

---

## Option 2: Use a Test Email Service (Mailtrap - No Real Emails)

If you just want to test the feature without sending real emails:

1. **Sign up at https://mailtrap.io** (free account)

2. **Get your credentials** from the inbox settings

3. **Update `.env`:**

```env
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your-mailtrap-username
EMAIL_PASSWORD=your-mailtrap-password
```

4. **Restart backend**

Emails will be captured in Mailtrap's inbox instead of being sent to real recipients.

---

## Option 3: Other Email Providers

### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=youremail@outlook.com
EMAIL_PASSWORD=your-password
```

### Yahoo
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=youremail@yahoo.com
EMAIL_PASSWORD=your-app-password
```

---

## Testing

After configuration:

1. **Restart backend server**
2. **Go to Partner page**
3. **Click "Reach Out to a Friend"**
4. **Enter an email address**
5. **Check:**
   - Backend console for success/error messages
   - Recipient's email inbox (or Mailtrap if using that)

---

## Current Configuration Status

Your `.env` currently shows:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

**These are placeholder values** - you need to replace them with real credentials for emails to send.

---

## Troubleshooting

**"Invalid login" error:**
- Make sure you're using an App Password (not your regular Gmail password)
- Remove any spaces from the app password

**"Connection timeout" error:**
- Check if your firewall is blocking port 587
- Try port 465 with `secure: true` in emailService.js

**Emails not arriving:**
- Check spam folder
- Verify EMAIL_USER is correct
- Check backend console for error messages

---

## For Production

When deploying to production:
- Use environment variables instead of `.env` file
- Consider using a dedicated email service like SendGrid, AWS SES, or Mailgun
- Never commit `.env` with real credentials to Git
