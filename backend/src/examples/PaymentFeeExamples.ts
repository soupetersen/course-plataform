import { PaymentFeeService } from '../services/PaymentFeeService';

/**
 * Testes e exemplos práticos do sistema de taxas
 */
export class PaymentFeeExamples {
  
  /**
   * Exemplo: Curso de R$ 100,00 com diferentes métodos
   */
  static demonstratePaymentMethods() {
    const coursePrice = 100.00;
    
    console.log('🎯 DEMONSTRAÇÃO: Curso de R$ 100,00\n');
    console.log('=' .repeat(60));
    
    const methods = ['PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'BOLETO'];
    
    methods.forEach(method => {
      const breakdown = PaymentFeeService.calculateFullBreakdown(coursePrice, method);
      
      console.log(`\n💳 ${method.replace('_', ' ')}:`);
      console.log(`   Aluno paga: R$ ${breakdown.studentPays.toFixed(2)}`);
      console.log(`   Taxa ${method}: R$ ${breakdown.mercadoPago.fee.toFixed(2)} (${breakdown.mercadoPago.details.description})`);
      console.log(`   Taxa Plataforma: R$ ${breakdown.platform.fee.toFixed(2)} (${breakdown.platform.percentage}%)`);
      console.log(`   Instrutor recebe: R$ ${breakdown.instructor.amount.toFixed(2)} (${breakdown.instructor.percentage}%)`);
      console.log(`   Total de taxas: R$ ${breakdown.totals.totalFees.toFixed(2)}`);
    });
    
    // Comparação
    const pixFee = PaymentFeeService.calculateMercadoPagoFee(coursePrice, 'PIX');
    const creditFee = PaymentFeeService.calculateMercadoPagoFee(coursePrice, 'CREDIT_CARD');
    const savings = creditFee.total - pixFee.total;
    
    console.log('\n💡 ECONOMIA:');
    console.log(`   PIX vs Cartão de Crédito: R$ ${savings.toFixed(2)} de economia`);
    console.log(`   Isso representa ${((savings / coursePrice) * 100).toFixed(2)}% do valor do curso!`);
  }
  
  /**
   * Exemplo: Diferentes valores de curso
   */
  static demonstrateDifferentPrices() {
    const prices = [29.90, 99.90, 299.90, 999.90];
    
    console.log('\n\n🎯 COMPARAÇÃO: Diferentes preços de curso\n');
    console.log('=' .repeat(80));
    
    prices.forEach(price => {
      console.log(`\n💰 Curso de R$ ${price.toFixed(2)}:`);
      
      const pixBreakdown = PaymentFeeService.calculateFullBreakdown(price, 'PIX');
      const creditBreakdown = PaymentFeeService.calculateFullBreakdown(price, 'CREDIT_CARD');
      
      console.log(`   PIX - Instrutor recebe: R$ ${pixBreakdown.instructor.amount.toFixed(2)}`);
      console.log(`   Cartão - Instrutor recebe: R$ ${creditBreakdown.instructor.amount.toFixed(2)}`);
      console.log(`   Diferença: R$ ${(pixBreakdown.instructor.amount - creditBreakdown.instructor.amount).toFixed(2)}`);
    });
  }
  
  /**
   * Simular um mês de vendas
   */
  static simulateMonthlyEarnings() {
    console.log('\n\n🎯 SIMULAÇÃO: Vendas de um mês\n');
    console.log('=' .repeat(60));
    
    // Simular vendas: 50 via PIX, 30 via Cartão, 10 via Boleto
    const sales = [
      { method: 'PIX', quantity: 50, price: 99.90 },
      { method: 'CREDIT_CARD', quantity: 30, price: 99.90 },
      { method: 'BOLETO', quantity: 10, price: 99.90 }
    ];
    
    let totalSales = 0;
    let totalInstructorEarnings = 0;
    let totalPlatformEarnings = 0;
    let totalGatewayFees = 0;
    
    sales.forEach(sale => {
      const breakdown = PaymentFeeService.calculateFullBreakdown(sale.price, sale.method);
      const saleTotal = sale.quantity * sale.price;
      const instructorTotal = sale.quantity * breakdown.instructor.amount;
      const platformTotal = sale.quantity * breakdown.platform.fee;
      const gatewayTotal = sale.quantity * breakdown.mercadoPago.fee;
      
      console.log(`\n${sale.method.replace('_', ' ')} (${sale.quantity} vendas):`);
      console.log(`   Faturamento: R$ ${saleTotal.toFixed(2)}`);
      console.log(`   Taxa Gateway: R$ ${gatewayTotal.toFixed(2)}`);
      console.log(`   Taxa Plataforma: R$ ${platformTotal.toFixed(2)}`);
      console.log(`   Para Instrutor: R$ ${instructorTotal.toFixed(2)}`);
      
      totalSales += saleTotal;
      totalInstructorEarnings += instructorTotal;
      totalPlatformEarnings += platformTotal;
      totalGatewayFees += gatewayTotal;
    });
    
    console.log('\n📊 RESUMO DO MÊS:');
    console.log(`   Faturamento Total: R$ ${totalSales.toFixed(2)}`);
    console.log(`   Taxas de Gateway: R$ ${totalGatewayFees.toFixed(2)} (${((totalGatewayFees/totalSales)*100).toFixed(1)}%)`);
    console.log(`   Ganho da Plataforma: R$ ${totalPlatformEarnings.toFixed(2)} (${((totalPlatformEarnings/totalSales)*100).toFixed(1)}%)`);
    console.log(`   Ganho do Instrutor: R$ ${totalInstructorEarnings.toFixed(2)} (${((totalInstructorEarnings/totalSales)*100).toFixed(1)}%)`);
  }
  
  /**
   * Executar todas as demonstrações
   */
  static runAllDemonstrations() {
    this.demonstratePaymentMethods();
    this.demonstrateDifferentPrices();
    this.simulateMonthlyEarnings();
    
    console.log('\n\n✅ Demonstrações concluídas!');
    console.log('\n💡 Principais insights:');
    console.log('   1. PIX sempre tem a menor taxa');
    console.log('   2. Para valores baixos, boleto pode ser menos vantajoso');
    console.log('   3. A diferença entre métodos impacta diretamente o ganho do instrutor');
    console.log('   4. Incentivar PIX aumenta a margem de todos os envolvidos');
  }
}
