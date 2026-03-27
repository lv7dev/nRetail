import { ApiProperty } from '@nestjs/swagger';

export class UserResponse {
  @ApiProperty({ example: 'clxyz123', description: 'User ID' })
  id: string;

  @ApiProperty({ example: '0901234567', description: 'Phone number' })
  phone: string;

  @ApiProperty({ example: 'Nguyen Van A', description: 'Full name' })
  name: string;

  @ApiProperty({ example: 'customer', description: 'Role: admin | staff | customer' })
  role: string;
}
