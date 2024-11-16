import { Module } from '@nestjs/common';
import { BaseService } from './services/base.service';

@Module({
  providers: [BaseService],
  exports: [BaseService],
})
export class CommonModule {}
