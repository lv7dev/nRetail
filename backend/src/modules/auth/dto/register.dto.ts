import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Short-lived registration token from OTP verify',
  })
  @IsString()
  @IsNotEmpty()
  registrationToken: string;

  @ApiProperty({ example: 'Nguyen Van A', description: 'Full name' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
