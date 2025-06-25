/**
 * Script para gerar previews dos templates de email em HTML
 */

import { EmailTemplateLoader } from '../services/EmailTemplateLoader';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Dados de teste para cada tipo de email
const testData = {
  'payment-approved': {
    userName: 'Beatriz Melodia',
    courseName: 'Curso Completo de Produção Musical',
    amount: '497.90',
    currency: 'R$',
    paymentDate: new Date().toLocaleDateString('pt-BR'),
    courseUrl: 'https://plataforma.com/curso/producao-musical'
  },
  'enrollment-confirmation': {
    userName: 'Gabriel Harmony',
    courseName: 'Teoria Musical Avançada',
    courseDescription: 'Domine harmonia, escalas, progressões e análise musical com exercícios práticos e composições.',
    instructorName: 'Maestro Carlos Santana',
    enrollmentDate: new Date().toLocaleDateString('pt-BR'),
    courseUrl: 'https://plataforma.com/curso/teoria-musical-avancada'
  },
  'pix-payment': {
    userName: 'Sofia Rhythm',
    courseName: 'Curso de Piano Popular e Jazz',
    amount: '349.90',
    currency: 'R$',
    pixCode: '00020126330014BR.GOV.BCB.PIX013662345678901234567890125204000053039865802BR5925MUSIC ACADEMY ONLINE6009Sao Paulo610805049-9506304B91A',
    qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
    expirationTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleTimeString('pt-BR')
  },
  'course-completion': {
    userName: 'Thiago Strings',
    courseName: 'Curso de Violão Fingerstyle',
    completionDate: new Date().toLocaleDateString('pt-BR'),
    certificateUrl: 'https://plataforma.com/certificado/violao-fingerstyle-12345'
  },
  'password-reset': {
    userName: 'Luna Vocal',
    resetUrl: 'https://plataforma.com/reset-password?token=music123harmony',
    expirationDate: new Date(Date.now() + 60 * 60 * 1000).toLocaleDateString('pt-BR'),
    expirationTime: new Date(Date.now() + 60 * 60 * 1000).toLocaleTimeString('pt-BR')
  }
};

async function generateEmailPreviews() {
  console.log('🎨 Gerando previews dos templates de email...\n');

  // Criar diretório de saída
  const outputDir = join(__dirname, '..', '..', 'email-previews');
  
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
    console.log(`📁 Diretório criado: ${outputDir}`);
  }

  const templates = EmailTemplateLoader.getAvailableTemplates();
  const generatedFiles: string[] = [];

  // Gerar arquivo index.html com links para todos os templates
  let indexHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview dos Templates de Email - Music Academy</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }
    .container {
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    }
    h1 {
      color: #2d3748;
      text-align: center;
      margin-bottom: 10px;
      font-size: 2.5rem;
    }
    .subtitle {
      text-align: center;
      color: #718096;
      margin-bottom: 40px;
      font-size: 1.1rem;
    }
    .templates-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    .template-card {
      background: linear-gradient(135deg, #00224D, #FF204E);
      color: white;
      padding: 24px;
      border-radius: 12px;
      text-decoration: none;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      border: none;
    }
    .template-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 30px rgba(255, 32, 78, 0.3);
      text-decoration: none;
      color: white;
    }
    .template-card h3 {
      margin: 0 0 10px 0;
      font-size: 1.3rem;
    }
    .template-card p {
      margin: 0;
      opacity: 0.9;
      font-size: 0.9rem;
    }
    .info {
      background: #f7fafc;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #00224D;
      margin-top: 30px;
    }
    .info h4 {
      margin: 0 0 10px 0;
      color: #2d3748;
    }
    .info p {
      margin: 5px 0;
      color: #4a5568;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎵 Templates de Email</h1>
    <p class="subtitle">Music Academy - Sistema de Notificações Musicais</p>
    
    <div class="templates-grid">
`;

  for (const templateName of templates) {
    console.log(`📄 Gerando preview: ${templateName}`);
    
    try {
      const data = testData[templateName as keyof typeof testData];
      if (!data) {
        console.log(`⚠️ Dados de teste não encontrados para ${templateName}`);
        continue;
      }

      const html = EmailTemplateLoader.loadTemplate(templateName, data);
      const fileName = `${templateName}-preview.html`;
      const filePath = join(outputDir, fileName);
      
      writeFileSync(filePath, html);
      generatedFiles.push(fileName);
      
      // Adicionar card ao index
      const templateTitles: Record<string, { title: string; description: string }> = {
        'payment-approved': {
          title: '🎵 Pagamento Aprovado',
          description: 'Confirmação de pagamento para curso de música'
        },
        'enrollment-confirmation': {
          title: '� Matrícula Confirmada',
          description: 'Boas-vindas ao novo aluno de música'
        },
        'pix-payment': {
          title: '🎹 Instruções PIX',
          description: 'Código PIX para pagamento do curso musical'
        },
        'course-completion': {
          title: '🏆 Curso Musical Concluído',
          description: 'Parabéns pela conclusão do curso de música'
        },
        'password-reset': {
          title: '� Reset de Senha',
          description: 'Link para redefinir senha da conta'
        }
      };

      const templateInfo = templateTitles[templateName] || { title: templateName, description: 'Template de email' };
      
      indexHtml += `
      <a href="${fileName}" class="template-card" target="_blank">
        <h3>${templateInfo.title}</h3>
        <p>${templateInfo.description}</p>
      </a>`;
      
      console.log(`✅ ${templateName}: Preview salvo como ${fileName}`);
      
    } catch (error) {
      console.log(`❌ ${templateName}: Erro ao gerar preview:`, error instanceof Error ? error.message : error);
    }
  }

  indexHtml += `
    </div>
    
    <div class="info">
      <h4>📋 Informações</h4>
      <p><strong>Templates gerados:</strong> ${generatedFiles.length}</p>
      <p><strong>Localização:</strong> backend/email-previews/</p>
      <p><strong>Como usar:</strong> Clique nos cards acima para visualizar cada template</p>
      <p><strong>Nota:</strong> Estes são templates de demonstração com dados fictícios</p>
    </div>
  </div>
</body>
</html>`;

  // Salvar index.html
  const indexPath = join(outputDir, 'index.html');
  writeFileSync(indexPath, indexHtml);
  
  console.log('\n🎉 Previews gerados com sucesso!');
  console.log(`📁 Localização: ${outputDir}`);
  console.log(`🌐 Arquivo principal: index.html`);
  console.log(`📊 Templates gerados: ${generatedFiles.length}`);
  
  console.log('\n📝 Arquivos criados:');
  console.log('   - index.html (página principal)');
  generatedFiles.forEach(file => {
    console.log(`   - ${file}`);
  });
  
  console.log('\n💡 Para visualizar:');
  console.log(`   1. Abra o arquivo: ${indexPath}`);
  console.log('   2. Ou execute: start index.html (Windows) / open index.html (Mac)');
  
  return outputDir;
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  generateEmailPreviews().catch(console.error);
}

export { generateEmailPreviews };
