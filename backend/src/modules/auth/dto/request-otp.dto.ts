import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RequestOtpDto {
  @ApiProperty({ example: '+84901234567', description: 'Phone number' })
  @IsString()
  @IsNotEmpty()
  phone: string;
}
