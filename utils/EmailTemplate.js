export const Verification_Email_Template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - AI Mall</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            border: 1px solid #ddd;
        }
        .header {
            background-color: #5555ff;
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 26px;
            font-weight: bold;
        }
        .content {
            padding: 30px 25px;
            color: #333;
        }
        .greeting {
            font-size: 16px;
            margin-bottom: 20px;
            color: #333;
        }
        .verification-code {
            display: block;
            margin: 25px 0;
            font-size: 32px;
            color: #5555ff;
            background: #f0f0ff;
            border: 2px dashed #5555ff;
            padding: 20px;
            text-align: center;
            border-radius: 8px;
            font-weight: bold;
            letter-spacing: 4px;
            font-family: 'Courier New', monospace;
        }
        .info-text {
            font-size: 15px;
            color: #555;
            margin: 15px 0;
        }
        .expiry-notice {
            background-color: #fff9e6;
            border-left: 4px solid #ffcc00;
            padding: 12px 15px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 14px;
            color: #666;
        }
        .security-note {
            margin-top: 25px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 5px;
            font-size: 13px;
            color: #666;
        }
        .footer {
            background-color: #f4f4f4;
            padding: 20px;
            text-align: center;
            color: #777;
            font-size: 12px;
            border-top: 1px solid #ddd;
        }
        .footer p {
            margin: 5px 0;
        }
        .footer a {
            color: #5555ff;
            text-decoration: none;
        }
        p {
            margin: 0 0 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Verify Your Email</h1>
        </div>
        <div class="content">
            <p class="greeting">Hello {name},</p>
            <p class="info-text">
                Thank you for signing up with AI Mall! To complete your registration and unlock access to our intelligent AI agents, please verify your email address using the code below:
            </p>
            <span class="verification-code">{verificationCode}</span>
            <div class="expiry-notice">
                ⏱️ This verification code will expire in 15 minutes for security purposes.
            </div>
            <p class="info-text">
                Simply enter this code on the verification page to activate your account and start exploring AI Mall.
            </p>
            <div class="security-note">
                <strong>🛡️ Security Notice:</strong> If you did not create an account with AI Mall, please disregard this email. No further action is required, and your email address will not be used.
            </div>
        </div>
        <div class="footer">
            <p><strong>AI Mall</strong> - Your Gateway to Intelligent AI Agents</p>
            <p>&copy; ${new Date().getFullYear()} AI Mall. All rights reserved.</p>
            <p>Need help? Contact us at <a href="mailto:support@aimall.com">support@aimall.com</a></p>
        </div>
    </div>
</body>
</html>
`;

export const Welcome_Email_Template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to AI Mall</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            color: #333;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            border: 1px solid #ddd;
        }
        .header {
            background-color: #007BFF;
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        .header p {
            margin: 10px 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 30px 25px;
        }
        .welcome-message {
            font-size: 18px;
            margin: 0 0 20px;
            color: #333;
        }
        .intro-text {
            font-size: 15px;
            color: #555;
            margin-bottom: 25px;
            line-height: 1.7;
        }
        .features-section {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
        }
        .features-title {
            font-size: 17px;
            font-weight: bold;
            color: #007BFF;
            margin: 0 0 15px;
        }
        .features-list {
            margin: 0;
            padding: 0 0 0 20px;
        }
        .features-list li {
            margin: 12px 0;
            font-size: 14px;
            color: #555;
            line-height: 1.6;
        }
        .agents-highlight {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
            text-align: center;
        }
        .agents-highlight h3 {
            margin: 0 0 10px;
            font-size: 18px;
        }
        .agents-highlight p {
            margin: 0;
            font-size: 14px;
            opacity: 0.95;
        }
        .button {
            display: inline-block;
            padding: 14px 30px;
            margin: 25px 0;
            background-color: #007BFF;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            text-align: center;
            font-size: 16px;
            font-weight: 600;
            transition: background-color 0.3s;
        }
        .button:hover {
            background-color: #0056b3;
        }
        .support-section {
            margin-top: 25px;
            padding: 15px;
            background-color: #e7f3ff;
            border-left: 4px solid #007BFF;
            border-radius: 4px;
            font-size: 14px;
            color: #555;
        }
        .footer {
            background-color: #f4f4f4;
            padding: 20px;
            text-align: center;
            color: #777;
            font-size: 12px;
            border-top: 1px solid #ddd;
        }
        .footer p {
            margin: 5px 0;
        }
        .footer a {
            color: #007BFF;
            text-decoration: none;
        }
        p {
            margin: 0 0 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Welcome to AI Mall!</h1>
            <p>Your Gateway to Intelligent AI Agents</p>
        </div>
        <div class="content">
            <p class="welcome-message">Hello {name},</p>
            <p class="intro-text">
                We're thrilled to welcome you to AI Mall, the ultimate marketplace for intelligent AI agents! 
                Your journey into the future of AI-powered solutions starts here. Whether you're looking to 
                automate tasks, enhance productivity, or explore cutting-edge AI capabilities, AI Mall has 
                everything you need.
            </p>

            <div class="agents-highlight">
                <h3>🤖 Discover Our AI Agents</h3>
                <p>
                    Explore a diverse collection of specialized AI agents designed to solve real-world problems. 
                    From customer service bots to data analysis assistants, creative content generators to 
                    productivity enhancers – find the perfect AI agent for your needs.
                </p>
            </div>

            <div class="features-section">
                <p class="features-title">🚀 Here's how to get started:</p>
                <ul class="features-list">
                    <li><strong>Browse AI Agents:</strong> Explore our marketplace and discover agents tailored to your specific needs – from business automation to creative assistance.</li>
                    <li><strong>Try Before You Buy:</strong> Test drive AI agents with free trials to find the perfect match for your requirements.</li>
                    <li><strong>Customize Your Experience:</strong> Configure agents to work exactly how you want them, with personalized settings and integrations.</li>
                    <li><strong>Join the Community:</strong> Connect with other AI enthusiasts, share experiences, and stay updated on the latest AI innovations.</li>
                    <li><strong>24/7 Support:</strong> Our dedicated support team is always here to help you make the most of AI Mall.</li>
                </ul>
            </div>

            <div style="text-align: center;">
                <a href="{dashboardUrl}" class="button">Explore AI Agents Now</a>
            </div>

            <div class="support-section">
                <strong>💡 Pro Tip:</strong> Start with our most popular agents to see AI Mall in action! 
                Check out our trending section for the top-rated AI solutions loved by our community.
            </div>

            <p class="intro-text" style="margin-top: 25px;">
                Thank you for choosing AI Mall. We're committed to bringing you the most advanced and 
                reliable AI agents to transform how you work, create, and innovate.
            </p>
        </div>
        <div class="footer">
            <p><strong>AI Mall</strong> - Empowering You with Intelligent AI Solutions</p>
            <p>&copy; ${new Date().getFullYear()} AI Mall. All rights reserved.</p>
            <p>Need assistance? Reach out to us at <a href="mailto:support@aimall.com">support@aimall.com</a></p>
            <p style="margin-top: 10px;">
                <a href="{privacyUrl}">Privacy Policy</a> | 
                <a href="{termsUrl}">Terms of Service</a>
            </p>
        </div>
    </div>
</body>
</html>
`;

export const Reset_Password_Email_Template = `
<!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Reset Your Password - AI Mall</title>
                        <style>
                            body {
                                font - family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                            margin: 0;
                            padding: 0;
                            background-color: #f4f4f4;
                            color: #333;
                            line-height: 1.6;
        }
                            .container {
                                max - width: 600px;
                            margin: 30px auto;
                            background: #ffffff;
                            border-radius: 8px;
                            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                            overflow: hidden;
                            border: 1px solid #ddd;
        }
                            .header {
                                background - color: #FF5733;
                            color: white;
                            padding: 30px 20px;
                            text-align: center;
        }
                            .header h1 {
                                margin: 0;
                            font-size: 26px;
                            font-weight: bold;
        }
                            .content {
                                padding: 30px 25px;
        }
                            .button {
                                display: inline-block;
                            padding: 14px 30px;
                            margin: 25px 0;
                            background-color: #FF5733;
                            color: white;
                            text-decoration: none;
                            border-radius: 6px;
                            text-align: center;
                            font-size: 16px;
                            font-weight: 600;
                            transition: background-color 0.3s;
        }
                            .button:hover {
                                background - color: #E64A19;
        }
                            .footer {
                                background - color: #f4f4f4;
                            padding: 20px;
                            text-align: center;
                            color: #777;
                            font-size: 12px;
                            border-top: 1px solid #ddd;
        }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>🔒 Reset Your Password</h1>
                            </div>
                            <div class="content">
                                <p>Hello {name},</p>
                                <p>We received a request to reset your password for your AI Mall account. Click the button below to proceed:</p>
                                <div style="text-align: center;">
                                    <a href="{resetUrl}" class="button">Reset Password</a>
                                </div>
                                <p>If you didn't request a password reset, you can safely ignore this email.</p>
                            </div>
                            <div class="footer">
                                <p><strong>AI Mall</strong> - Secure & Intelligent AI Solutions</p>
                            </div>
                        </div>
                    </body>
                </html>
                `;
export const Reset_Password_OTP_Template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset OTP - AI Mall</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            border: 1px solid #ddd;
        }
        .header {
            background-color: #8b5cf6;
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 26px;
            font-weight: bold;
        }
        .content {
            padding: 30px 25px;
            color: #333;
        }
        .greeting {
            font-size: 16px;
            margin-bottom: 20px;
            color: #333;
        }
        .verification-code {
            display: block;
            margin: 25px 0;
            font-size: 32px;
            color: #8b5cf6;
            background: #f5f3ff;
            border: 2px dashed #8b5cf6;
            padding: 20px;
            text-align: center;
            border-radius: 8px;
            font-weight: bold;
            letter-spacing: 4px;
            font-family: 'Courier New', monospace;
        }
        .info-text {
            font-size: 15px;
            color: #555;
            margin: 15px 0;
        }
        .expiry-notice {
            background-color: #fff9e6;
            border-left: 4px solid #ffcc00;
            padding: 12px 15px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 14px;
            color: #666;
        }
        .footer {
            background-color: #f4f4f4;
            padding: 20px;
            text-align: center;
            color: #777;
            font-size: 12px;
            border-top: 1px solid #ddd;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Password Reset OTP</h1>
        </div>
        <div class="content">
            <p class="greeting">Hello {name},</p>
            <p class="info-text">
                We received a request to reset your password for your AI Mall account. Please use the following One-Time Password (OTP) to proceed with your password recovery:
            </p>
            <span class="verification-code">{otp}</span>
            <div class="expiry-notice">
                ⏱️ This OTP will expire in 10 minutes for security purposes.
            </div>
            <p class="info-text">
                If you did not request a password reset, please ignore this email and ensure your account is secure.
            </p>
        </div>
        <div class="footer">
            <p><strong>AI-MALL</strong> - Secure & Intelligent AI Solutions</p>
            <p>&copy; ${new Date().getFullYear()} AI-MALL. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

export const Password_Success_Template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Updated Successfully</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f6f9fc; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #eef2f6; }
        .header { background: linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%); padding: 60px 20px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
        .content { padding: 40px 35px; color: #4b5563; line-height: 1.6; }
        .greeting { font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 20px; }
        .success-box { background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 25px 0; display: flex; align-items: center; gap: 15px; }
        .success-icon { font-size: 24px; }
        .success-message { color: #15803d; font-size: 15px; font-weight: 600; margin: 0; }
        .info-text { font-size: 15px; margin-bottom: 20px; }
        .security-tips { background-color: #f8fafc; border-radius: 12px; padding: 25px; margin-top: 30px; }
        .security-tips h3 { margin: 0 0 15px 0; font-size: 16px; color: #1e293b; display: flex; align-items: center; gap: 8px; }
        .tip-item { font-size: 14px; margin-bottom: 10px; display: flex; align-items: flex-start; gap: 10px; color: #64748b; }
        .footer { background-color: #f9fafb; padding: 30px; text-align: center; color: #9ca3af; font-size: 13px; border-top: 1px solid #f1f5f9; }
        .brand { color: #8b5cf6; font-weight: 800; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛡️ Security Notification</h1>
        </div>
        <div class="content">
            <p class="greeting">Hi {name},</p>
            <p class="info-text">Your password has been successfully updated for your <strong>AI-MALL</strong> account. You can now log in using your new credentials.</p>
            
            <div class="success-box">
                <span class="success-icon">✅</span>
                <p class="success-message">Update Successful</p>
            </div>

            <p class="info-text">If you performed this change, you safely ignore this email. No further action is required.</p>

            <div class="security-tips">
                <h3>⚠️ Security Notice</h3>
                <div class="tip-item"><span>•</span> If you did not make this change, please contact our support team immediately to secure your account.</div>
                <div class="tip-item"><span>•</span> We recommend using a unique and strong password for every online account.</div>
            </div>
        </div>
        <div class="footer">
            <p>Driven by <a href="#" class="brand">AI-MALL</a> — Intelligent Solutions for Tomorrow</p>
            <p>&copy; ${new Date().getFullYear()} AI-MALL. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;


// Helper function to replace placeholders in templates
export const renderEmailTemplate = (template, data) => {
    let rendered = template;

    // Replace all placeholders with actual data
    Object.keys(data).forEach(key => {
        const placeholder = new RegExp(`{${key}}`, 'g');
        rendered = rendered.replace(placeholder, data[key] || '');
    });

    return rendered;
};

// Helper function to create plain text version (Important for spam prevention!)
export const stripHTMLToText = (html) => {
    return html
        .replace(/<style[^>]*>.*?<\/style>/gi, '')
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};

// Usage Examples:
/*
// Verification Email
const verificationEmail = renderEmailTemplate(Verification_Email_Template, {
    name: 'John Doe',
    verificationCode: '123456'
});

// Welcome Email
const welcomeEmail = renderEmailTemplate(Welcome_Email_Template, {
    name: 'John Doe',
    dashboardUrl: 'https://aimall.com/dashboard',
    unsubscribeUrl: 'https://aimall.com/unsubscribe',
    privacyUrl: 'https://aimall.com/privacy',
    termsUrl: 'https://aimall.com/terms'
});

// Create plain text version
const plainText = stripHTMLToText(welcomeEmail);
*/