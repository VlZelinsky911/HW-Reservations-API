import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
  UnsupportedMediaTypeException,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CsvService } from './csv.service';
import type { CsvRow } from './types';

const ACCEPTED_MIME_TYPES = new Set([
  'text/csv',
  'application/vnd.ms-excel',
  'text/plain',
]);

const MAX_SIZE_BYTES =
  parseInt(process.env['MAX_UPLOAD_SIZE_MB'] ?? '5', 10) * 1024 * 1024;

@Controller('csv')
export class CsvController {
  constructor(private readonly csvService: CsvService) {}

  @Post('parse')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_SIZE_BYTES },
    }),
  )
  async parse(
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<CsvRow[]> {
    if (!file) {
      throw new BadRequestException('file field is required');
    }

    if (!ACCEPTED_MIME_TYPES.has(file.mimetype)) {
      throw new UnsupportedMediaTypeException(
        `Unsupported media type: ${file.mimetype}. Use text/csv or application/vnd.ms-excel`,
      );
    }

    return this.csvService.parse(file.buffer);
  }
}
