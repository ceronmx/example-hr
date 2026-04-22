import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';
import { LeaveType } from '../../domain/entities/leave-type.enum';

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
    description: 'The type of leave requested',
    enum: LeaveType,
    example: LeaveType.VACATION,
  })
  @IsEnum(LeaveType)
  @IsNotEmpty()
  leaveTypeId: LeaveType;

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
