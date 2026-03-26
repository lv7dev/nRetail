import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Short-lived OTP token from POST /auth/otp/verify',
  })
  @IsString()
  @IsNotEmpty()
  otpToken: string;

  @ApiProperty({ example: 'Nguyen Van A', description: 'Full name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'password123',
    description: 'Password (min 6 chars)',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'password123', description: 'Confirm password' })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}
