import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateTimeOffRequestDto {
  @ApiProperty({
    description: 'The unique identifier of the employee',
    example: 'emp-123',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @ApiProperty({
    description: 'The unique identifier of the location',
    example: 'loc-456',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  locationId: string;

  @ApiProperty({
    description: 'The unique identifier of the leave type',
    example: 'vacation-001',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  leaveTypeId: string;

  @ApiProperty({
    description: 'Number of days requested',
    minimum: 0.5,
    example: 2,
    type: 'number',
  })
  @IsNumber()
  @IsPositive()
  daysRequested: number;

  @ApiProperty({
    description: 'Start date of the time off in ISO format',
    example: '2026-05-01',
    format: 'date-iso8601',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'End date of the time off in ISO format',
    example: '2026-05-03',
    format: 'date-iso8601',
  })
  @IsDateString()
  endDate: string;
}
