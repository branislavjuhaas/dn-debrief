export type ApiResponse<T> = {
  success: boolean;
  statusCode: number;
  data: T;
};
