import { Module } from '@nestjs/common';
import { BaseService } from './services/base.service';
import { CloudinaryService } from './services/cloudinary.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [BaseService, CloudinaryService],
  exports: [BaseService, CloudinaryService],
  imports: [ConfigModule],
})
export class CommonModule {}
