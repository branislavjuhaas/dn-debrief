import * as Minio from "minio";

export const minioClient = new Minio.Client({
  endPoint:
    process.env.S3_ENDPOINT?.split("://")[1]?.split(":")[0] ?? "localhost",
  port: parseInt(
    process.env.S3_ENDPOINT?.split("://")[1]?.split(":")[1] ?? "9000",
  ),
  useSSL: true,
  accessKey: process.env.S3_ACCESS_KEY!,
  secretKey: process.env.S3_SECRET_KEY!,
});
