import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OutletRole, UserOutletStatus } from '@prisma/client';

export class OutletListItemResponse {
  @ApiProperty({ example: 'clxyz123', description: 'Outlet ID' })
  id: string;

  @ApiProperty({ example: 'Main Store', description: 'Outlet name' })
  name: string;

  @ApiProperty({ example: '123 Nguyen Hue, Q1', description: 'Outlet address', nullable: true })
  address: string | null;

  @ApiProperty({
    example: OutletRole.OWNER,
    enum: OutletRole,
    nullable: true,
    description: 'Membership role for connected outlets; null for not-connected memberships',
  })
  role: OutletRole | null;

  @ApiPropertyOptional({
    enum: UserOutletStatus,
    description: 'Membership status for not-connected outlets',
  })
  membershipStatus?: UserOutletStatus;
}
