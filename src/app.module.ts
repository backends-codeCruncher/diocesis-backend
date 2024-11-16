import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { NewsModule } from './news/news.module';
import { ArticulesModule } from './articules/articules.module';

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule, CommonModule, NewsModule, ArticulesModule],
})
export class AppModule {}
