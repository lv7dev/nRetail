import { ApiProperty } from '@nestjs/swagger';
import { OutletRole } from '@prisma/client';

export class MyOutletResponse {
  @ApiProperty({ example: 'clxyz123', description: 'Outlet ID' })
  id: string;

  @ApiProperty({ example: 'Main Store', description: 'Outlet name' })
  name: string;

  @ApiProperty({ example: '123 Nguyen Hue, Q1', description: 'Outlet address', nullable: true })
  address: string | null;

  @ApiProperty({
    example: OutletRole.OWNER,
    description: 'User role in this outlet',
    enum: OutletRole,
  })
  role: OutletRole;
}
