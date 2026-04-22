import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateTimeOffRequestDto {
  @ApiProperty({ description: 'The unique identifier of the employee' })
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @ApiProperty({ description: 'The unique identifier of the location' })
  @IsString()
  @IsNotEmpty()
  locationId: string;

  @ApiProperty({ description: 'The unique identifier of the leave type' })
  @IsString()
  @IsNotEmpty()
  leaveTypeId: string;

  @ApiProperty({ description: 'Number of days requested', minimum: 0.5 })
  @IsNumber()
  @IsPositive()
  daysRequested: number;

  @ApiProperty({ description: 'Start date of the time off in ISO format' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End date of the time off in ISO format' })
  @IsDateString()
  endDate: string;
}
