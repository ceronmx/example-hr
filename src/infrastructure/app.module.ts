import { Module } from '@nestjs/common';
import { TimeOffModule } from './time-off.module';

@Module({
  imports: [TimeOffModule],
})
export class AppModule {}
