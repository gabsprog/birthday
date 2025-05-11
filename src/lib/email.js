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
      dark: '#f05252',
      light: '#FFFFFF',
    },
  });
  
  // Email template with inline styles
  const htmlContent = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #f05252; margin-bottom: 5px;">BirthdayLove</h1>
      </div>
      
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #f05252; font-size: 24px; margin-bottom: 20px; text-align: center;">Seu site especial está pronto!</h2>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
          Obrigado por criar um site especial com BirthdayLove. Seu site está ativo e pronto para ser compartilhado com sua pessoa especial!
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <img src="${qrCodeDataUrl}" alt="QR Code" style="width: 200px; height: 200px;" />
          <p style="color: #666; font-size: 14px; margin-top: 10px;">Escaneie este QR code para acessar seu site diretamente</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 25px;">
          <p style="color: #333; font-size: 14px; margin: 0;">URL do seu site:</p>
          <a href="${siteUrl}" style="color: #f05252; font-size: 16px; word-break: break-all; text-decoration: none;">${siteUrl}</a>
        </div>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Compartilhe este link ou QR code com a pessoa especial em sua vida para surpreendê-la com sua bela mensagem!
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; color: #777; font-size: 14px;">
        <p>&copy; ${new Date().getFullYear()} BirthdayLove.site. Todos os direitos reservados.</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"BirthdayLove" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Seu Site Especial está Pronto! 🎉',
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