export interface ErrorResponse {
  statusCode: number;
  message: string;
  requestId?: string;
  timestamp: string;
  path: string;
}

export interface ResolvedError {
  status: number;
  message: string;
}
