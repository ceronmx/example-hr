import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SyncBatchBalancesUseCase } from '../../application/use-cases/sync-batch-balances.use-case';

@ApiTags('Sync')
@Controller('sync')
export class SyncController {
  constructor(
    private readonly syncBatchBalancesUseCase: SyncBatchBalancesUseCase,
  ) {}

  @Post('batch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trigger manual batch reconciliation of balances' })
  @ApiResponse({
    status: 200,
    description: 'Reconciliation triggered successfully',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error during synchronization',
  })
  async syncBatch() {
    await this.syncBatchBalancesUseCase.execute();
    return { message: 'Batch sync completed' };
  }
}
