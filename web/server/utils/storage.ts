import { promises as fs } from "node:fs";
import path from "node:path";
import { AwsClient } from "aws4fetch";

const aws = new AwsClient({
  accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
  service: "s3",
  region: "auto",
});

/**
 * Use for ALL files (public and private)
 * Returns a presigned PUT URL with temporary write authorization.
 * The client can then upload the file directly to S3 using this URL.
 * @param key file key (path) in the S3 bucket
 * @param contentType the MIME type of the file being uploaded
 * @returns a presigned URL that can be used to upload the file directly to S3
 */
export const getPresignedUploadUrl = async (
  key: string,
  contentType: string = "application/octet-stream",
) => {
  if (import.meta.dev || import.meta.test) {
    return `${process.env.BETTER_AUTH_URL}/api/storage/upload?key=${encodeURIComponent(key)}&contentType=${encodeURIComponent(contentType)}`;
  }

  const objectUrl = `${process.env.S3_PUBLIC_ENDPOINT}/debrief/${key}?X-Amz-Expires=3600`;
  const signedRequest = await aws.sign(
    new Request(objectUrl, {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-cache, must-revalidate",
      },
    }),
    { aws: { signQuery: true } },
  );

  return signedRequest.url;
};

/**
 * Use for PUBLIC files
 * Returns a public URL that can be used to access the file directly.
 * This URL does not require any authentication or authorization.
 * The file must be publicly accessible in the S3 bucket for this to work.
 * @param key file key (path) in the S3 bucket
 * @returns a public URL that can be used to access the file directly
 */
export const getPublicFileUrl = (key: string) => {
  if (import.meta.dev || import.meta.test) {
    return `${process.env.BETTER_AUTH_URL}/api/storage/files/${key}`;
  }

  return `${process.env.S3_PUBLIC_ENDPOINT}/debrief/${key}`;
};

/**
 * Use for PRIVATE files
 * Returns a presigned GET URL with temporary read authorization.
 * The client can then download the file directly from S3 using this URL.
 * @param key file key (path) in the S3 bucket
 * @param expiresInSeconds how long the presigned URL should be valid for (default: 3600 seconds)
 * @returns a presigned URL that can be used to download the file directly from S3
 */
export const getPresignedDownloadUrl = async (
  key: string,
  expiresInSeconds: number = 3600,
) => {
  if (import.meta.dev || import.meta.test) {
    return `${process.env.BETTER_AUTH_URL}/api/storage/files/${key}`;
  }

  const objectUrl = `${process.env.S3_PUBLIC_ENDPOINT}/debrief/${key}?X-Amz-Expires=${expiresInSeconds}`;

  // Sign a default GET request with signQuery: true
  const signedRequest = await aws.sign(
    new Request(objectUrl, { method: "GET" }),
    {
      aws: { signQuery: true },
    },
  );

  return signedRequest.url;
};

/**
 * Delete a file from the configured storage backend.
 * In development this removes the local file from the upload directory.
 * In production this issues a signed DELETE request to S3-compatible storage.
 */
export const deleteFile = async (key: string) => {
  if (import.meta.dev || import.meta.test) {
    const filePath = path.join(process.cwd(), ".data/uploads", key);
    await fs.rm(filePath, { force: true });
    return;
  }

  const objectUrl = `${process.env.S3_PUBLIC_ENDPOINT}/debrief/${key}`;
  const signedRequest = await aws.sign(
    new Request(objectUrl, { method: "DELETE" }),
    { aws: { signQuery: true } },
  );

  await fetch(signedRequest.url, { method: "DELETE" });
};
