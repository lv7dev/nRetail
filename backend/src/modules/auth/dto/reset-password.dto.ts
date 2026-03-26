import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Short-lived OTP token from POST /auth/otp/verify',
  })
  @IsString()
  @IsNotEmpty()
  otpToken: string;

  @ApiProperty({
    example: 'newpassword123',
    description: 'New password (min 6 chars)',
  })
  @IsString()
  @MinLength(6, { message: 'New password must be at least 6 characters' })
  newPassword: string;

  @ApiProperty({
    example: 'newpassword123',
    description: 'Confirm new password',
  })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}
