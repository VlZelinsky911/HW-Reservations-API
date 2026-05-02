import { Injectable } from '@nestjs/common';
import { AmenityRepository } from './amenity.repository';
import { AmenityNotFoundError } from '../../shared/errors/app.errors';
import type { AmenityDto } from './types';

@Injectable()
export class AmenityService {
  constructor(private readonly amenityRepository: AmenityRepository) {}

  async findByIdOrThrow(id: number): Promise<AmenityDto> {
    const amenity = await this.amenityRepository.findById(id);
    if (!amenity) throw new AmenityNotFoundError(id);
    return amenity;
  }
}
