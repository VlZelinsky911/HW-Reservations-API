import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import csvParser from 'csv-parser';
import { InvalidCsvError } from '../../shared/errors/app.errors';
import type { CsvRow } from './types';

const SNIFF_BYTES = 512;
const SUPPORTED_DELIMITERS = [';', ','] as const;

function detectDelimiter(sample: string): string {
  const counts = SUPPORTED_DELIMITERS.map((d) => ({
    delimiter: d,
    count: sample.split(d).length - 1,
  }));
  const best = counts.reduce((a, b) => (b.count > a.count ? b : a));
  return best.delimiter;
}

@Injectable()
export class CsvService {
  async parse(buffer: Buffer): Promise<CsvRow[]> {
    if (buffer.length === 0) {
      throw new InvalidCsvError('file is empty');
    }

    const sample = buffer.subarray(0, SNIFF_BYTES).toString('utf8');
    const delimiter = detectDelimiter(sample);

    return new Promise<CsvRow[]>((resolve, reject) => {
      const rows: CsvRow[] = [];
      const stream = Readable.from(buffer);

      stream
        .pipe(csvParser({ separator: delimiter }))
        .on('data', (row: CsvRow) => rows.push(row))
        .on('end', () => {
          if (rows.length === 0) {
            reject(new InvalidCsvError('no data rows found'));
          } else {
            resolve(rows);
          }
        })
        .on('error', (err: Error) => reject(new InvalidCsvError(err.message)));
    });
  }
}
