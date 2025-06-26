import { readFileSync } from 'fs';
import { join } from 'path';

export class EmailTemplateLoader {
  private static readonly TEMPLATES_DIR = join(__dirname, '..', 'templates', 'emails');


  static loadTemplate(templateName: string, variables: Record<string, any>): string {
    const templatePath = join(this.TEMPLATES_DIR, templateName, `${templateName}.html`);
    
    try {
      let template = readFileSync(templatePath, 'utf-8');
      
      template = template.replace(/\{\{(\w+)\}\}/g, (match, variableName) => {
        return variables[variableName] ?? match;
      });
      
      template = template.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, variableName, content) => {
        return variables[variableName] ? content : '';
      });
      
      template = template.replace(/\{\{currentYear\}\}/g, new Date().getFullYear().toString());
      template = template.replace(/\{\{platformUrl\}\}/g, process.env.FRONTEND_URL || 'http://localhost:5173');
      
      return template;
    } catch (error) {
      console.error(`Erro ao carregar template ${templateName}:`, error);
      throw new Error(`Template ${templateName} não encontrado`);
    }
  }

  /**
   * Lista todos os templates disponíveis
   */
  static getAvailableTemplates(): string[] {
    return [
      'payment-approved',
      'enrollment-confirmation', 
      'pix-payment',
      'course-completion',
      'password-reset'
    ];
  }

  /**
   * Valida se um template existe
   */
  static templateExists(templateName: string): boolean {
    const templatePath = join(this.TEMPLATES_DIR, templateName, `${templateName}.html`);
    try {
      readFileSync(templatePath, 'utf-8');
      return true;
    } catch {
      return false;
    }
  }
}
