export interface ForgotPasswordDto {
  email: string;
}

export interface ValidateResetCodeDto {
  email: string;
  code: string;
}

export interface ResetPasswordDto {
  email: string;
  code: string;
  newPassword: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
}
