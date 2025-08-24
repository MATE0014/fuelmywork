import { TransactionalEmailsApi, SendSmtpEmail } from "@sendinblue/client"

const apiInstance = new TransactionalEmailsApi()
const apiKey = apiInstance.authentications["apiKey"]
apiKey.apiKey = process.env.BREVO_API_KEY

const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL 
const SENDER_NAME = "Fuelmywork"

export async function sendOTPEmail(email, otp, name) {
  try {
    const sendSmtpEmail = new SendSmtpEmail()

    sendSmtpEmail.subject = "Verify Your Fuelmywork Account"
    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Account</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Fuelmywork!</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <h2 style="color: #495057; margin-top: 0;">Hi ${name}!</h2>
          
          <p style="font-size: 16px; margin-bottom: 25px;">
            Thank you for signing up for Fuelmywork! To complete your registration and verify your email address, please use the verification code below:
          </p>
          
          <div style="background: white; border: 2px dashed #007bff; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
            <h3 style="color: #007bff; margin: 0 0 10px 0;">Your Verification Code</h3>
            <div style="font-size: 32px; font-weight: bold; color: #495057; letter-spacing: 5px; font-family: 'Courier New', monospace;">
              ${otp}
            </div>
          </div>
          
          <p style="font-size: 14px; color: #6c757d; margin-bottom: 20px;">
            This code will expire in 10 minutes for security reasons.
          </p>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #856404;">
              <strong>Security Note:</strong> If you didn't create an account with Fuelmywork, please ignore this email.
            </p>
          </div>
          
          <p style="font-size: 14px; color: #6c757d;">
            Best regards,<br>
            The Fuelmywork Team
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding: 20px; font-size: 12px; color: #6c757d;">
          <p>© 2024 Fuelmywork. All rights reserved.</p>
          <p>This is an automated email, please do not reply.</p>
        </div>
      </body>
      </html>
    `
    sendSmtpEmail.sender = { name: SENDER_NAME, email: SENDER_EMAIL }
    sendSmtpEmail.to = [{ email: email, name: name }]

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail)
    console.log("OTP email sent successfully:", result)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error("Error sending OTP email:", error)
    return { success: false, error: error.message }
  }
}

export async function sendPasswordResetEmail(email, otp, name) {
  try {
    const sendSmtpEmail = new SendSmtpEmail()

    sendSmtpEmail.subject = "Reset Your Fuelmywork Password"
    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset Request</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <h2 style="color: #495057; margin-top: 0;">Hi ${name}!</h2>
          
          <p style="font-size: 16px; margin-bottom: 25px;">
            We received a request to reset your password for your Fuelmywork account. Use the code below to reset your password:
          </p>
          
          <div style="background: white; border: 2px dashed #dc3545; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
            <h3 style="color: #dc3545; margin: 0 0 10px 0;">Your Reset Code</h3>
            <div style="font-size: 32px; font-weight: bold; color: #495057; letter-spacing: 5px; font-family: 'Courier New', monospace;">
              ${otp}
            </div>
          </div>
          
          <p style="font-size: 14px; color: #6c757d; margin-bottom: 20px;">
            This code will expire in 10 minutes for security reasons.
          </p>
          
          <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #721c24;">
              <strong>Security Alert:</strong> If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
            </p>
          </div>
          
          <p style="font-size: 14px; color: #6c757d;">
            Best regards,<br>
            The Fuelmywork Team
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding: 20px; font-size: 12px; color: #6c757d;">
          <p>© 2024 Fuelmywork. All rights reserved.</p>
          <p>This is an automated email, please do not reply.</p>
        </div>
      </body>
      </html>
    `
    sendSmtpEmail.sender = { name: SENDER_NAME, email: SENDER_EMAIL }
    sendSmtpEmail.to = [{ email: email, name: name }]

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail)
    console.log("Password reset email sent successfully:", result)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error("Error sending password reset email:", error)
    return { success: false, error: error.message }
  }
}

export async function sendPasswordChangeNotificationEmail(email, name) {
  try {
    const sendSmtpEmail = new SendSmtpEmail()

    sendSmtpEmail.subject = "Password Changed Successfully - Fuelmywork"
    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Changed</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Password Changed Successfully</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <h2 style="color: #495057; margin-top: 0;">Hi ${name}!</h2>
          
          <p style="font-size: 16px; margin-bottom: 25px;">
            Your Fuelmywork account password has been successfully changed on ${new Date().toLocaleDateString()}.
          </p>
          
          <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #155724;">
              <strong>Security Confirmation:</strong> If you made this change, no further action is required.
            </p>
          </div>
          
          <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #721c24;">
              <strong>Didn't make this change?</strong> If you didn't change your password, please contact our support team immediately and consider changing your password again.
            </p>
          </div>
          
          <p style="font-size: 14px; color: #6c757d;">
            Best regards,<br>
            The Fuelmywork Team
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding: 20px; font-size: 12px; color: #6c757d;">
          <p>© 2024 Fuelmywork. All rights reserved.</p>
          <p>This is an automated email, please do not reply.</p>
        </div>
      </body>
      </html>
    `
    sendSmtpEmail.sender = { name: SENDER_NAME, email: SENDER_EMAIL }
    sendSmtpEmail.to = [{ email: email, name: name }]

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail)
    console.log("Password change notification sent successfully:", result)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error("Error sending password change notification:", error)
    return { success: false, error: error.message }
  }
}

export async function sendAccountDeletionNotificationEmail(email, name) {
  try {
    const sendSmtpEmail = new SendSmtpEmail()

    sendSmtpEmail.subject = "Account Deleted - Fuelmywork"
    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Deleted</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6c757d 0%, #495057 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Account Deleted</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <h2 style="color: #495057; margin-top: 0;">Goodbye ${name}</h2>
          
          <p style="font-size: 16px; margin-bottom: 25px;">
            Your Fuelmywork account has been permanently deleted on ${new Date().toLocaleDateString()} as requested.
          </p>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #856404;">
              <strong>What happens next:</strong>
            </p>
            <ul style="margin: 10px 0 0 0; font-size: 14px; color: #856404;">
              <li>All your profile data has been permanently removed</li>
              <li>Your payment information has been securely deleted</li>
              <li>Your supporter relationships have been terminated</li>
              <li>This action cannot be undone</li>
            </ul>
          </div>
          
          <p style="font-size: 16px; margin-bottom: 25px;">
            Thank you for being part of the Fuelmywork community. We're sorry to see you go!
          </p>
          
          <p style="font-size: 14px; color: #6c757d;">
            Best regards,<br>
            The Fuelmywork Team
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding: 20px; font-size: 12px; color: #6c757d;">
          <p>© 2024 Fuelmywork. All rights reserved.</p>
          <p>This is an automated email, please do not reply.</p>
        </div>
      </body>
      </html>
    `
    sendSmtpEmail.sender = { name: SENDER_NAME, email: SENDER_EMAIL }
    sendSmtpEmail.to = [{ email: email, name: name }]

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail)
    console.log("Account deletion notification sent successfully:", result)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error("Error sending account deletion notification:", error)
    return { success: false, error: error.message }
  }
}
