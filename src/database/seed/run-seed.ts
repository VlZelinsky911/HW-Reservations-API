import 'reflect-metadata';
import 'dotenv/config';
import { PrismaService } from '../prisma.service';
import { CsvSeederService } from './csv-seeder.service';

async function main(): Promise<void> {
  const prisma = new PrismaService();
  await prisma.onModuleInit();

  const seeder = new CsvSeederService(prisma);
  await seeder.seed();

  await prisma.onModuleDestroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
