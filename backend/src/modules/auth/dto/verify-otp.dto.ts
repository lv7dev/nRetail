import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({ example: '0901234567', description: 'Phone number' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: '999999', description: '6-digit OTP code' })
  @IsString()
  @Matches(/^[0-9]{6}$/, { message: 'OTP must be exactly 6 digits' })
  otp: string;
}
