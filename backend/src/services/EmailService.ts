import { Resend } from 'resend';
import { EmailTemplateLoader } from './EmailTemplateLoader';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface PaymentApprovedEmailData {
  userName: string;
  courseName: string;
  amount: number;
  currency: string;
  paymentDate: Date;
}

export interface EnrollmentEmailData {
  userName: string;
  courseName: string;
  courseDescription?: string;
  instructorName?: string;
  enrollmentDate: Date;
  courseUrl?: string;
}

export interface PixPaymentEmailData {
  userName: string;
  courseName: string;
  amount: number;
  currency: string;
  pixCode: string;
  qrCode?: string;
  expirationDate: Date;
}

export interface CourseCompletionEmailData {
  userName: string;
  courseName: string;
  completionDate: Date;
  certificateUrl?: string;
}

export interface PasswordResetEmailData {
  userName: string;
  resetCode: string;
  expirationTime: Date;
}

export class EmailService {
  private resend: Resend;
  private defaultFrom: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is required');
    }

    this.resend = new Resend(apiKey);
    this.defaultFrom = process.env.DEFAULT_FROM_EMAIL || 'no-reply@courseplatform.com';
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const result = await this.resend.emails.send({
        from: options.from || this.defaultFrom,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      return {
        success: true,
        messageId: result.data?.id,
      };
    } catch (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async sendPaymentApprovedEmail(email: string, data: PaymentApprovedEmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const html = EmailTemplateLoader.loadTemplate('payment-approved', {
      userName: data.userName,
      courseName: data.courseName,
      amount: data.amount.toFixed(2),
      currency: data.currency,
      paymentDate: data.paymentDate.toLocaleDateString('pt-BR'),
      courseUrl: `${process.env.FRONTEND_URL}/learn/${data.courseName.toLowerCase().replace(/\s+/g, '-')}`
    });
    
    return this.sendEmail({
      to: email,
      subject: `✅ Pagamento aprovado - ${data.courseName}`,
      html,
    });
  }

  async sendEnrollmentConfirmationEmail(email: string, data: EnrollmentEmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const html = EmailTemplateLoader.loadTemplate('enrollment-confirmation', {
      userName: data.userName,
      courseName: data.courseName,
      courseDescription: data.courseDescription || '',
      instructorName: data.instructorName || '',
      enrollmentDate: data.enrollmentDate.toLocaleDateString('pt-BR'),
      courseUrl: data.courseUrl || `${process.env.FRONTEND_URL}/courses`
    });
    
    return this.sendEmail({
      to: email,
      subject: `🎉 Bem-vindo ao curso ${data.courseName}`,
      html,
    });
  }

  async sendPixPaymentInstructionsEmail(email: string, data: PixPaymentEmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const html = EmailTemplateLoader.loadTemplate('pix-payment', {
      userName: data.userName,
      courseName: data.courseName,
      amount: data.amount.toFixed(2),
      currency: data.currency,
      pixCode: data.pixCode,
      qrCode: data.qrCode || '',
      expirationDate: data.expirationDate.toLocaleDateString('pt-BR'),
      expirationTime: data.expirationDate.toLocaleTimeString('pt-BR')
    });
    
    return this.sendEmail({
      to: email,
      subject: `💳 Instruções para pagamento PIX - ${data.courseName}`,
      html,
    });
  }

  async sendCourseCompletionEmail(email: string, data: CourseCompletionEmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const html = EmailTemplateLoader.loadTemplate('course-completion', {
      userName: data.userName,
      courseName: data.courseName,
      completionDate: data.completionDate.toLocaleDateString('pt-BR'),
      certificateUrl: data.certificateUrl || ''
    });
    
    return this.sendEmail({
      to: email,
      subject: `🏆 Parabéns! Você concluiu o curso ${data.courseName}`,
      html,
    });
  }

  async sendPasswordResetEmail(email: string, data: PasswordResetEmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const html = EmailTemplateLoader.loadTemplate('password-reset', {
      userName: data.userName,
      resetCode: data.resetCode,
      expirationDate: data.expirationTime.toLocaleDateString('pt-BR'),
      expirationTime: data.expirationTime.toLocaleTimeString('pt-BR')
    });
    
    return this.sendEmail({
      to: email,
      subject: `🔒 Código de redefinição de senha - EduMy`,
      html,
    });
  }
}
