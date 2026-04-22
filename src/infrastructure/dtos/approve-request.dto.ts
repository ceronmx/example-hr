import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ApproveRequestDto {
  @ApiProperty({
    description: 'The unique identifier of the manager approving the request',
  })
  @IsString()
  @IsNotEmpty()
  managerId: string;
}
