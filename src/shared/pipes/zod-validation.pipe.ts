import { PipeTransform, BadRequestException } from '@nestjs/common';
import { ZodType } from 'zod';

export class ZodValidationPipe<T> implements PipeTransform {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message).join('; ');
      throw new BadRequestException(messages);
    }
    return result.data;
  }
}
