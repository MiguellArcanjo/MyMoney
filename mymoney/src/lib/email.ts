import nodemailer from 'nodemailer';

// Configuração do transporter (você pode usar Gmail, Outlook, ou outros serviços)
const transporter = nodemailer.createTransport({
  service: 'gmail', // ou 'outlook', 'yahoo', etc.
  auth: {
    user: process.env.EMAIL_USER, // seu email
    pass: process.env.EMAIL_PASS, // sua senha de app (não a senha normal)
  },
});

export async function enviarEmailVerificacao(email: string, nome: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const linkVerificacao = `${baseUrl}/verificar-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verifique seu email - MyMoney',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
        <div style="background-color: #0E2A4C; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; color: #00D1B2;">Organizze</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Verificação de Email</p>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #0E2A4C; margin-bottom: 20px;">Olá, ${nome}!</h2>
          
          <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
            Obrigado por se cadastrar no Organizze! Para começar a usar sua conta, 
            precisamos verificar seu endereço de email.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${linkVerificacao}" 
               style="background-color: #00D1B2; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 8px; font-weight: bold; 
                      display: inline-block; font-size: 16px;">
              Verificar Email
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
            Se o botão não funcionar, copie e cole este link no seu navegador:
          </p>
          
          <p style="color: #00D1B2; font-size: 14px; word-break: break-all; margin-bottom: 20px;">
            ${linkVerificacao}
          </p>
          
          <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
            Este link expira em 24 horas por motivos de segurança.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            Se você não se cadastrou no Organizze, pode ignorar este email.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return false;
  }
}

export async function enviarEmailRedefinicaoSenha(email: string, nome: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const linkRedefinicao = `${baseUrl}/redefinir-senha?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Redefinir Senha - MyMoney',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
        <div style="background-color: #0E2A4C; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; color: #00D1B2;">Organizze</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Redefinição de Senha</p>
        </div>
        <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #0E2A4C; margin-bottom: 20px;">Olá, ${nome}!</h2>
          <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
            Recebemos uma solicitação para redefinir sua senha.<br />
            Clique no botão abaixo para criar uma nova senha. Se você não solicitou, ignore este e-mail.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${linkRedefinicao}"
               style="background-color: #00D1B2; color: white; padding: 15px 30px;
                      text-decoration: none; border-radius: 8px; font-weight: bold;
                      display: inline-block; font-size: 16px;">
              Redefinir Senha
            </a>
          </div>
          <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
            Se o botão não funcionar, copie e cole este link no seu navegador:
          </p>
          <p style="color: #00D1B2; font-size: 14px; word-break: break-all; margin-bottom: 20px;">
            ${linkRedefinicao}
          </p>
          <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
            Este link expira em 1 hora por motivos de segurança.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            Organizze - Controle suas finanças de forma inteligente
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return false;
  }
} 