import { CsvService } from '../../src/modules/csv/csv.service';
import { InvalidCsvError } from '../../src/shared/errors/app.errors';

const service = new CsvService();

const toBuffer = (content: string): Buffer => Buffer.from(content, 'utf8');

describe('CsvService.parse', () => {
  it('parses comma-delimited CSV', async () => {
    const csv = 'id,name\n1,Gym\n2,Pool';
    const result = await service.parse(toBuffer(csv));
    expect(result).toEqual([
      { id: '1', name: 'Gym' },
      { id: '2', name: 'Pool' },
    ]);
  });

  it('parses semicolon-delimited CSV', async () => {
    const csv = 'id;name\n1;Gym\n2;Pool';
    const result = await service.parse(toBuffer(csv));
    expect(result).toEqual([
      { id: '1', name: 'Gym' },
      { id: '2', name: 'Pool' },
    ]);
  });

  it('auto-detects semicolon when both delimiters present but ; dominates', async () => {
    const csv = 'id;name;city\n1;Gym;Kyiv\n2;Pool;Lviv';
    const result = await service.parse(toBuffer(csv));
    expect(result[0]).toEqual({ id: '1', name: 'Gym', city: 'Kyiv' });
  });

  it('trims whitespace in values', async () => {
    const csv = 'id,name\n1, Gym ';
    const result = await service.parse(toBuffer(csv));
    expect(result[0]?.id).toBe('1');
  });

  it('throws InvalidCsvError for empty buffer', async () => {
    await expect(service.parse(Buffer.alloc(0))).rejects.toBeInstanceOf(
      InvalidCsvError,
    );
  });

  it('throws InvalidCsvError for headers-only CSV', async () => {
    await expect(service.parse(toBuffer('id,name\n'))).rejects.toBeInstanceOf(
      InvalidCsvError,
    );
  });

  it('handles single-column CSV', async () => {
    const csv = 'name\nGym\nPool';
    const result = await service.parse(toBuffer(csv));
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ name: 'Gym' });
  });

  it('handles Windows line endings (CRLF)', async () => {
    const csv = 'id,name\r\n1,Gym\r\n2,Pool';
    const result = await service.parse(toBuffer(csv));
    expect(result).toHaveLength(2);
    expect(result[0]?.id).toBe('1');
  });
});
