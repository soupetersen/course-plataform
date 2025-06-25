import { EmailService } from '../services/EmailService';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

async function testEmailService() {
  console.log('🧪 Testando EmailService...\n');

  // Verificar configuração
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY não configurada!');
    console.log('💡 Configure a variável RESEND_API_KEY no arquivo .env');
    return;
  }

  if (!process.env.DEFAULT_FROM_EMAIL) {
    console.warn('⚠️ DEFAULT_FROM_EMAIL não configurada, usando padrão');
  }

  const emailService = new EmailService();
  const testEmail = process.env.TEST_EMAIL || 'test@example.com';

  console.log(`📧 Enviando emails de teste para: ${testEmail}\n`);

  // Teste 1: Email de pagamento aprovado
  console.log('1️⃣ Testando email de pagamento aprovado...');
  try {
    const result1 = await emailService.sendPaymentApprovedEmail(testEmail, {
      userName: 'João Silva (Teste)',
      courseName: 'Curso de Teste - JavaScript',
      amount: 99.90,
      currency: 'BRL',
      paymentDate: new Date(),
    });
    
    if (result1.success) {
      console.log('✅ Pagamento aprovado enviado com sucesso!');
      console.log(`   Message ID: ${result1.messageId}`);
    } else {
      console.log('❌ Erro ao enviar pagamento aprovado:', result1.error);
    }
  } catch (error) {
    console.log('❌ Erro no teste de pagamento aprovado:', error);
  }

  console.log('');

  // Teste 2: Email de matrícula
  console.log('2️⃣ Testando email de matrícula confirmada...');
  try {
    const result2 = await emailService.sendEnrollmentConfirmationEmail(testEmail, {
      userName: 'João Silva (Teste)',
      courseName: 'Curso de Teste - JavaScript',
      courseDescription: 'Um curso completo de JavaScript para iniciantes',
      instructorName: 'Maria Santos',
      enrollmentDate: new Date(),
    });
    
    if (result2.success) {
      console.log('✅ Matrícula confirmada enviada com sucesso!');
      console.log(`   Message ID: ${result2.messageId}`);
    } else {
      console.log('❌ Erro ao enviar matrícula confirmada:', result2.error);
    }
  } catch (error) {
    console.log('❌ Erro no teste de matrícula:', error);
  }

  console.log('');

  // Teste 3: Email PIX
  console.log('3️⃣ Testando email de instruções PIX...');
  try {
    const result3 = await emailService.sendPixPaymentInstructionsEmail(testEmail, {
      userName: 'João Silva (Teste)',
      courseName: 'Curso de Teste - JavaScript',
      amount: 99.90,
      currency: 'BRL',
      pixCode: '00020126580014br.gov.bcb.pix013662c47a4c-teste-mock-pix-code5204000053039865802BR5925COURSE PLATFORM TESTE6009SAO PAULO62070503***6304ABCD',
      expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    
    if (result3.success) {
      console.log('✅ Instruções PIX enviadas com sucesso!');
      console.log(`   Message ID: ${result3.messageId}`);
    } else {
      console.log('❌ Erro ao enviar instruções PIX:', result3.error);
    }
  } catch (error) {
    console.log('❌ Erro no teste PIX:', error);
  }

  console.log('');

  // Teste 4: Email de conclusão
  console.log('4️⃣ Testando email de conclusão de curso...');
  try {
    const result4 = await emailService.sendCourseCompletionEmail(testEmail, {
      userName: 'João Silva (Teste)',
      courseName: 'Curso de Teste - JavaScript',
      completionDate: new Date(),
    });
    
    if (result4.success) {
      console.log('✅ Conclusão de curso enviada com sucesso!');
      console.log(`   Message ID: ${result4.messageId}`);
    } else {
      console.log('❌ Erro ao enviar conclusão:', result4.error);
    }
  } catch (error) {
    console.log('❌ Erro no teste de conclusão:', error);
  }

  console.log('');

  // Teste 5: Email de reset de senha
  console.log('5️⃣ Testando email de reset de senha...');
  try {
    const result5 = await emailService.sendPasswordResetEmail(testEmail, {
      userName: 'João Silva (Teste)',
      resetUrl: 'https://example.com/reset-password?token=test-token-123',
      expirationTime: new Date(Date.now() + 60 * 60 * 1000),
    });
    
    if (result5.success) {
      console.log('✅ Reset de senha enviado com sucesso!');
      console.log(`   Message ID: ${result5.messageId}`);
    } else {
      console.log('❌ Erro ao enviar reset:', result5.error);
    }
  } catch (error) {
    console.log('❌ Erro no teste de reset:', error);
  }

  console.log('\n🎉 Testes concluídos!');
  console.log('💡 Verifique sua caixa de entrada (e spam) para ver os emails de teste.');
}

// Executar testes
if (require.main === module) {
  testEmailService().catch(console.error);
}

export { testEmailService };
