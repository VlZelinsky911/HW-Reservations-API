import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CsvController } from './csv.controller';
import { CsvService } from './csv.service';

@Module({
  imports: [AuthModule],
  controllers: [CsvController],
  providers: [CsvService],
})
export class CsvModule {}
