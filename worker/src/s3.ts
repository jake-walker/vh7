import { AwsClient } from 'aws4fetch';

const aws = new AwsClient({
  accessKeyId: S3_ACCESS_KEY_ID,
  secretAccessKey: S3_SECRET_ACCESS_KEY,
  region: S3_DEFAULT_REGION,
});

async function makeRequest(path: string = '/', options: RequestInit | Request = {}) {
  const url = new URL(`${S3_ENDPOINT_URL}/${S3_BUCKET}${path}`);
  const signedRequest = await aws.sign(url, {
    aws: {
      service: 's3',
    },
    ...options,
  });
  return fetch(signedRequest, {
    cf: {
      cacheEverything: true,
    },
  });
}

export async function getObjectMetadata(filename: string) {
  const req = makeRequest(`/${filename}`, {
    method: 'HEAD',
  });

  return req;
}

export async function getObject(filename: string) {
  const req = makeRequest(`/${filename}`);
  return req;
}

export async function putObject(filename: string, file: File) {
  const req = makeRequest(`/${filename}`, {
    method: 'PUT',
    body: file.stream(),
    headers: {
      'Content-Type': file.type,
      'Content-Length': file.size.toString(),
    },
  });

  return req;
}
