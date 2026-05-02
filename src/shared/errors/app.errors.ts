export class AmenityNotFoundError extends Error {
  constructor(id: number) {
    super(`Amenity with id ${id} not found`);
    this.name = 'AmenityNotFoundError';
  }
}

export class InvalidCsvError extends Error {
  constructor(detail?: string) {
    super(detail ? `Invalid CSV: ${detail}` : 'Invalid or malformed CSV');
    this.name = 'InvalidCsvError';
  }
}

export class UnsupportedMediaTypeError extends Error {
  constructor(mimeType: string) {
    super(`Unsupported media type: ${mimeType}`);
    this.name = 'UnsupportedMediaTypeError';
  }
}
