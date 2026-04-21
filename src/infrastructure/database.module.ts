import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Balance } from '../domain/balance.entity';
import { BalanceTypeOrmRepository } from './balance-typeorm.repository';
import { BALANCE_REPOSITORY } from '../application/balance.repository';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [Balance],
      synchronize: true, // Only for development
    }),
    TypeOrmModule.forFeature([Balance]),
  ],
  providers: [
    {
      provide: BALANCE_REPOSITORY,
      useClass: BalanceTypeOrmRepository,
    },
  ],
  exports: [BALANCE_REPOSITORY],
})
export class DatabaseModule {}
