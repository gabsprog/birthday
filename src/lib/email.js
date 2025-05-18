// src/lib/email.js - Updated with Resend
import { Resend } from 'resend';
import QRCode from 'qrcode';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendSiteEmail(email, site) {
  const siteUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${site.slug}`;
  const editUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/edit?slug=${site.slug}&editHash=${site.editHash}`;
  
  // Generate QR code as data URL
  const qrCodeDataUrl = await QRCode.toDataURL(siteUrl, {
    width: 300,
    margin: 2,
    color: {
      dark: '#f05252',
      light: '#FFFFFF',
    },
  });
  
  // Email template with inline styles - Updated for Resend
  const htmlContent = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #f05252; margin-bottom: 5px;">BirthdayLove</h1>
      </div>
      
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #f05252; font-size: 24px; margin-bottom: 20px; text-align: center;">Your special website is ready!</h2>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
          Thank you for creating a special site with BirthdayLove. Your site is now live and ready to be shared with your special someone!
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <img src="${qrCodeDataUrl}" alt="QR Code" style="width: 200px; height: 200px;" />
          <p style="color: #666; font-size: 14px; margin-top: 10px;">Scan this QR code to visit your site directly</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 25px;">
          <p style="color: #333; font-size: 14px; margin: 0;">Your site URL:</p>
          <a href="${siteUrl}" style="color: #f05252; font-size: 16px; word-break: break-all; text-decoration: none;">${siteUrl}</a>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 25px;">
          <p style="color: #333; font-size: 14px; margin: 0;">Want to make changes to your site?</p>
          <p style="color: #333; font-size: 14px; margin: 10px 0;">Use this link to edit your site anytime:</p>
          <a href="${editUrl}" style="color: #f05252; font-size: 16px; word-break: break-all; text-decoration: none;">${editUrl}</a>
          <p style="color: #666; font-size: 12px; margin-top: 8px;"><strong>Important:</strong> Save this email for future reference. The edit link is unique and cannot be recovered.</p>
        </div>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Share this link or QR code with the special person in your life to surprise them with your beautiful message!
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; color: #777; font-size: 14px;">
        <p>&copy; ${new Date().getFullYear()} BirthdayLove.site. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: `BirthdayLove <noreply@birthdaylove.site>`,
      to: email,
      subject: 'Your Special Website is Ready! 🎉',
      html: htmlContent,
      attachments: [{
        filename: 'qrcode.png',
        content: qrCodeDataUrl.split(';base64,').pop(),
        encoding: 'base64',
      }],
    });
    
    if (error) {
      console.error('Error sending email with Resend:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Email sent successfully with Resend:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}