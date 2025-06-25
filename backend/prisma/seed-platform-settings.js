const { PrismaClient } = require('@prisma/client')

async function seedPlatformSettings() {
  const prisma = new PrismaClient()
  
  try {
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })
    
    if (!adminUser) {
      console.error('No admin user found. Skipping platform settings seed.')
      return
    }
    
    const settings = [
      {
        id: 'platform_fee_setting',
        key: 'PLATFORM_FEE_PERCENTAGE',
        value: '10',
        type: 'NUMBER',
        description: 'Porcentagem da taxa da plataforma sobre vendas de cursos (após taxas do gateway)',
        updatedBy: adminUser.id
      },
      {
        id: 'refund_days_setting',
        key: 'REFUND_DAYS_LIMIT',
        value: '7',
        type: 'NUMBER',
        description: 'Limite de dias para solicitar reembolso',
        updatedBy: adminUser.id
      },
      {
        id: 'min_payout_setting',
        key: 'MINIMUM_PAYOUT_AMOUNT',
        value: '50',
        type: 'NUMBER',
        description: 'Valor mínimo para saque de instrutores (R$)',
        updatedBy: adminUser.id
      },
      {
        id: 'balance_hold_days_setting',
        key: 'BALANCE_HOLD_DAYS',
        value: '30',
        type: 'NUMBER',
        description: 'Dias para reter saldo do instrutor (proteção contra chargeback)',
        updatedBy: adminUser.id
      }
    ]
    
    for (const setting of settings) {
      await prisma.platformSetting.upsert({
        where: { key: setting.key },
        update: setting,
        create: setting
      })
      console.log(`✅ Platform setting ${setting.key} created/updated`)
    }
    
    console.log('✅ Platform settings seed completed')
  } catch (error) {
    console.error('❌ Error seeding platform settings:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedPlatformSettings()
