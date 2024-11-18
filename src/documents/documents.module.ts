import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { AuthModule } from '../auth/auth.module';
import { CommonModule } from '../common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './entities/document.entity';

@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService],
  imports: [AuthModule, CommonModule, TypeOrmModule.forFeature([Document])],
})
export class DocumentsModule {}
