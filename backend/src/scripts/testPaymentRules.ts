import { PrismaClient } from '@prisma/client';

async function testPaymentSystemRules() {
  const prisma = new PrismaClient();

  try {
    console.log('🧪 Testando regras do sistema de pagamentos...\n');

    console.log('📚 TESTE 1: Curso Gratuito');
    
    const instructor = await prisma.user.findFirst({
      where: { role: 'INSTRUCTOR' }
    });

    if (instructor) {
      const freeCourse = await prisma.course.create({
        data: {
          title: 'Curso Introdutório Gratuito',
          description: 'Um curso completamente gratuito para testar o sistema',
          price: 0,
          instructorId: instructor.id,
          isPublished: true
        }
      });

      console.log(`✅ Curso gratuito criado: "${freeCourse.title}" - Preço: R$ ${freeCourse.price.toFixed(2)}`);
    }

    console.log('\n💰 TESTE 2: Limite de Saque Mensal');
    
    if (instructor) {
      let balance = await prisma.instructorBalance.findUnique({
        where: { instructorId: instructor.id }
      });

      if (!balance) {
        balance = await prisma.instructorBalance.create({
          data: {
            instructorId: instructor.id,
            availableBalance: 500,
            pendingBalance: 200,
            totalEarnings: 1200,
            totalWithdrawn: 500
          }
        });
        console.log(`✅ Saldo criado para teste: R$ ${balance.availableBalance.toFixed(2)} disponível`);
      }

      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      const existingPayout = await prisma.payoutRequest.findFirst({
        where: {
          instructorId: instructor.id,
          requestMonth: currentMonth,
          requestYear: currentYear
        }
      });

      if (existingPayout) {
        console.log(`⚠️  Instrutor já solicitou saque este mês (${currentMonth}/${currentYear})`);
        console.log(`   ID: ${existingPayout.id}, Valor: R$ ${existingPayout.amount.toFixed(2)}`);
      } else {
        console.log(`✅ Instrutor pode solicitar saque este mês (${currentMonth}/${currentYear})`);
      }
    }

    console.log('\n⚙️  TESTE 3: Configurações da Plataforma');
    
    const platformSettings = await prisma.platformSetting.findMany({
      orderBy: { key: 'asc' }
    });

    console.log('📋 Configurações atuais:');
    platformSettings.forEach(setting => {
      console.log(`   ${setting.key}: ${setting.value} (${setting.description})`);
    });

    const gatewayFeeSetting = platformSettings.find(s => s.key.includes('STRIPE_FEE'));
    if (gatewayFeeSetting) {
      console.log('⚠️  ATENÇÃO: Configuração de fee do gateway ainda existe e deveria ser removida');
    } else {
      console.log('✅ Fee do gateway não é mais configurável - agora usa taxas fixas do Mercado Pago');
    }

    console.log('\n📊 TESTE 4: Estrutura de Saque Mensal');
    
    const payoutRequests = await prisma.payoutRequest.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        amount: true,
        requestMonth: true,
        requestYear: true,
        status: true,
        createdAt: true
      }
    });

    if (payoutRequests.length > 0) {
      console.log('📋 Últimas solicitações de saque:');
      payoutRequests.forEach(payout => {
        console.log(`   ${payout.id}: R$ ${payout.amount.toFixed(2)} em ${payout.requestMonth}/${payout.requestYear} - ${payout.status}`);
      });
    } else {
      console.log('📋 Nenhuma solicitação de saque encontrada');
    }

    console.log('\n✅ Teste das regras concluído!');

  } catch (error) {
    console.error('❌ Erro durante teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  testPaymentSystemRules();
}

export { testPaymentSystemRules };
