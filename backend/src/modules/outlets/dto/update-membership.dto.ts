import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

const membershipActions = ['confirm', 'reject'] as const;

export class UpdateMembershipDto {
  @ApiProperty({
    enum: membershipActions,
    description: 'Membership action to apply',
  })
  @IsIn(membershipActions)
  action: 'confirm' | 'reject';
}
