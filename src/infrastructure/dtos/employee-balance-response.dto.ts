import { ApiProperty } from '@nestjs/swagger';

export class EmployeeBalanceResponseDto {
  @ApiProperty({
    description: 'The type of leave (e.g., VACATION)',
    example: 'VACATION',
  })
  leaveTypeId: string;

  @ApiProperty({
    description: 'The actual balance currently stored in the HCM system',
    example: 20.5,
  })
  actualBalance: number;

  @ApiProperty({
    description:
      'The balance available after subtracting all active (Pending/Approved/Syncing) requests',
    example: 15.5,
  })
  projectedBalance: number;
}
