import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: '0901234567', description: 'Phone number (format: 0xxxxxxxxx)' })
  @IsString()
  @Matches(/^0[0-9]{9}$/, { message: 'Phone number must be in format 0xxxxxxxxx' })
  phone: string;

  @ApiProperty({ example: 'password123', description: 'Password' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
