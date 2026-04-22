import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Get,
  HttpStatus,
  HttpCode,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CreateRequestUseCase } from '../../application/use-cases/create-request.use-case';
import { ApproveRequestUseCase } from '../../application/use-cases/approve-request.use-case';
import type { ITimeOffRepository } from '../../application/ports/time-off-repository.interface';
import { CreateTimeOffRequestDto } from '../dtos/create-time-off-request.dto';
import { ApproveRequestDto } from '../dtos/approve-request.dto';
import { BALANCE_REPOSITORY } from '../../application/balance.repository';

@ApiTags('Time-Off')
@Controller('time-off')
export class TimeOffController {
  constructor(
    private readonly createRequestUseCase: CreateRequestUseCase,
    private readonly approveRequestUseCase: ApproveRequestUseCase,
    @Inject(BALANCE_REPOSITORY)
    private readonly repository: ITimeOffRepository,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new time-off request' })
  @ApiResponse({ status: 201, description: 'Request created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Illegal state transition or bad request',
  })
  @ApiResponse({ status: 422, description: 'Insufficient balance' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async create(@Body() dto: CreateTimeOffRequestDto) {
    return await this.createRequestUseCase.execute({
      ...dto,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
    });
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve a pending time-off request' })
  @ApiParam({ name: 'id', description: 'The UUID of the time-off request' })
  @ApiResponse({ status: 200, description: 'Request approved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid transition' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async approve(@Param('id') id: string, @Body() dto: ApproveRequestDto) {
    return await this.approveRequestUseCase.execute({
      requestId: id,
      managerId: dto.managerId,
    });
  }

  @Get('balances/:employeeId/:locationId')
  @ApiOperation({ summary: 'Get current balance for an employee' })
  @ApiParam({
    name: 'employeeId',
    description: 'The unique identifier of the employee',
  })
  @ApiParam({
    name: 'locationId',
    description: 'The unique identifier of the location',
  })
  @ApiResponse({ status: 200, description: 'Balance retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Balance not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getBalances(
    @Param('employeeId') employeeId: string,
    @Param('locationId') locationId: string,
  ) {
    return await this.repository.findBalance(
      employeeId,
      locationId,
      'VACATION',
    );
  }
}
