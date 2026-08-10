import { AwsClient } from "aws4fetch";

const aws = new AwsClient({
  accessKeyId: process.env.S3_ACCESS_KEY_ID || "dev",
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "dev",
  service: "s3",
  region: "auto",
});

export async function getPresignedUploadUrl(key: string) {
  if (import.meta.dev || import.meta.test) {
    // In dev: Return a local Nuxt server route (e.g. http://localhost:3000/api/storage/upload?key=...)
    return `${process.env.BETTER_AUTH_URL}/api/storage/upload?key=${encodeURIComponent(key)}`;
  }

  // In production (MinIO): Generate standard S3 SigV4 presigned URL
  const objectUrl = `${process.env.S3_PUBLIC_ENDPOINT}/debrief/${key}?X-Amz-Expires=3600`;
  const signedRequest = await aws.sign(
    new Request(objectUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/octet-stream",
        "Cache-Control": "no-cache, must-revalidate",
      },
    }),
    { aws: { signQuery: true } },
  );

  return signedRequest.url;
}

export function getFileUrl(key: string) {
  if (import.meta.dev || import.meta.test) {
    // Local dev endpoint
    return `${process.env.BETTER_AUTH_URL}/api/storage/files/${key}`;
  }

  // Production MinIO endpoint
  return `${process.env.S3_PUBLIC_ENDPOINT}/debrief-app/${key}`;
}
