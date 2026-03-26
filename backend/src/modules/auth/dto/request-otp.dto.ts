import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class RequestOtpDto {
  @ApiProperty({ example: '0901234567', description: 'Phone number (format: 0xxxxxxxxx)' })
  @IsString()
  @Matches(/^0[0-9]{9}$/, { message: 'Phone number must be in format 0xxxxxxxxx' })
  phone: string;
}
