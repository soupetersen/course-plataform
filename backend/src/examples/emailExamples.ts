import { EmailService } from '../services/EmailService';

// Exemplo de uso do EmailService
async function exampleEmailUsage() {
  const emailService = new EmailService();

  try {
    // 1. Email de pagamento aprovado
    const paymentResult = await emailService.sendPaymentApprovedEmail('student@example.com', {
      userName: 'João Silva',
      courseName: 'JavaScript Completo',
      amount: 199.90,
      currency: 'BRL',
      paymentDate: new Date(),
    });
    console.log('Pagamento aprovado:', paymentResult);

    // 2. Email de matrícula confirmada
    const enrollmentResult = await emailService.sendEnrollmentConfirmationEmail('student@example.com', {
      userName: 'João Silva',
      courseName: 'JavaScript Completo',
      courseDescription: 'Aprenda JavaScript do zero ao avançado',
      instructorName: 'Maria Santos',
      enrollmentDate: new Date(),
      courseUrl: 'https://yourplatform.com/learn/javascript-completo',
    });
    console.log('Matrícula confirmada:', enrollmentResult);

    // 3. Email com instruções PIX
    const pixResult = await emailService.sendPixPaymentInstructionsEmail('student@example.com', {
      userName: 'João Silva',
      courseName: 'JavaScript Completo',
      amount: 199.90,
      currency: 'BRL',
      pixCode: '00020126580014br.gov.bcb.pix013662c47a4c-19e6-4d8e-9c8f-3f4b1a8f7b9d5204000053039865802BR5925COURSE PLATFORM LTDA6009SAO PAULO62070503***6304ABCD',
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...', // Base64 do QR Code
      expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
    });
    console.log('Instruções PIX:', pixResult);

    // 4. Email de conclusão de curso
    const completionResult = await emailService.sendCourseCompletionEmail('student@example.com', {
      userName: 'João Silva',
      courseName: 'JavaScript Completo',
      completionDate: new Date(),
      certificateUrl: 'https://yourplatform.com/certificates/abc123',
    });
    console.log('Curso concluído:', completionResult);

    // 5. Email de redefinição de senha
    const resetResult = await emailService.sendPasswordResetEmail('student@example.com', {
      userName: 'João Silva',
      resetUrl: 'https://yourplatform.com/reset-password?token=abc123xyz',
      expirationTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hora
    });
    console.log('Reset de senha:', resetResult);

    // 6. Email customizado
    const customResult = await emailService.sendEmail({
      to: 'student@example.com',
      subject: 'Bem-vindo à nossa plataforma!',
      html: `
        <h1>Olá!</h1>
        <p>Este é um email customizado.</p>
        <p>Acesse nossa plataforma: <a href="https://yourplatform.com">Clique aqui</a></p>
      `,
    });
    console.log('Email customizado:', customResult);

  } catch (error) {
    console.error('Erro ao enviar emails:', error);
  }
}

// Para testar (descomente a linha abaixo)
// exampleEmailUsage();
