import nodemailer from 'nodemailer';
import QRCode from 'qrcode';

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendSiteEmail(email, site) {
  const siteUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${site.slug}`;
  
  // Generate QR code as data URL
  const qrCodeDataUrl = await QRCode.toDataURL(siteUrl, {
    width: 300,
    margin: 2,
    color: {
      dark: '#010599FF',
      light: '#FFBF60FF',
    },
  });
  
  // Email template with inline styles
  const htmlContent = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="${process.env.NEXT_PUBLIC_BASE_URL}/images/logo.svg" alt="Birthday Love" style="width: 150px; height: auto;" />
      </div>
      
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
        <h1 style="color: #f05252; font-size: 24px; margin-bottom: 20px; text-align: center;">Your special site is ready!</h1>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
          Thank you for creating a special site with BirthdayLove. Your site is now live and ready to be shared with your loved one!
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <img src="${qrCodeDataUrl}" alt="QR Code" style="width: 200px; height: 200px;" />
          <p style="color: #666; font-size: 14px; margin-top: 10px;">Scan this QR code to access your site directly</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 25px;">
          <p style="color: #333; font-size: 14px; margin: 0;">Your site URL:</p>
          <a href="${siteUrl}" style="color: #0ea5e9; font-size: 16px; word-break: break-all; text-decoration: none;">${siteUrl}</a>
        </div>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Simply share this link or QR code with the special person in your life to surprise them with your beautiful message!
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; color: #777; font-size: 14px;">
        <p>© ${new Date().getFullYear()} BirthdayLove.site. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"BirthdayLove" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Special Site is Ready! 🎉',
      html: htmlContent,
      attachments: [{
        filename: 'qrcode.png',
        content: qrCodeDataUrl.split(';base64,').pop(),
        encoding: 'base64',
      }],
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}