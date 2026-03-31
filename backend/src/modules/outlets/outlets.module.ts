import { Module } from '@nestjs/common';
import { OutletsController } from './outlets.controller';
import { OutletsRepository } from './outlets.repository';
import { OutletsService } from './outlets.service';

@Module({
  controllers: [OutletsController],
  providers: [OutletsRepository, OutletsService],
  exports: [OutletsService],
})
export class OutletsModule {}
