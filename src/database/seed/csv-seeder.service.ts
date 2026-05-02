import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createReadStream } from 'fs';
import { join } from 'path';
import csvParser from 'csv-parser';
import { PrismaService } from '../prisma.service';
import {
  transformAmenityRow,
  transformReservationRow,
} from './csv-row.transformer';
import type { RawAmenityRow, RawReservationRow } from './types';

function parseCsv<T>(filePath: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const rows: T[] = [];
    createReadStream(filePath)
      .pipe(csvParser({ separator: ';' }))
      .on('data', (row: T) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

@Injectable()
export class CsvSeederService implements OnModuleInit {
  private readonly logger = new Logger(CsvSeederService.name);
  private readonly dataDir = join(process.cwd(), 'data');

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    await this.seed();
  }

  async seed(): Promise<void> {
    const amenityCount = await this.prisma.amenity.count();
    const reservationCount = await this.prisma.reservation.count();

    if (amenityCount > 0 && reservationCount > 0) {
      this.logger.log('Seed data already present — skipping');
      return;
    }

    this.logger.log('Seeding database from CSV files...');

    if (amenityCount === 0) {
      await this.seedAmenities();
    }

    if (reservationCount === 0) {
      await this.seedReservations();
    }

    this.logger.log('Seeding complete');
  }

  private async seedAmenities(): Promise<void> {
    const rows = await parseCsv<RawAmenityRow>(
      join(this.dataDir, 'amenity.csv'),
    );
    const data = rows.map(transformAmenityRow);
    await this.prisma.amenity.createMany({ data, skipDuplicates: true });
    this.logger.log(`Seeded ${data.length} amenities`);
  }

  private async seedReservations(): Promise<void> {
    const rows = await parseCsv<RawReservationRow>(
      join(this.dataDir, 'reservations.csv'),
    );
    const data = rows.map(transformReservationRow);
    await this.prisma.reservation.createMany({ data, skipDuplicates: true });
    this.logger.log(`Seeded ${data.length} reservations`);
  }
}
