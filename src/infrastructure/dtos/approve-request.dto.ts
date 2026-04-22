import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ApproveRequestDto {
  @ApiProperty({
    description: 'The unique identifier of the manager approving the request',
    example: 'mgr-789',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  managerId: string;
}
