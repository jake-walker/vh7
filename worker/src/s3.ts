import { AwsClient } from 'aws4fetch';

const aws = new AwsClient({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_DEFAULT_REGION,
});

async function makeRequest(path: string = '/', options: RequestInit | Request = {}) {
  const url = new URL(`https://${AWS_S3_BUCKET}.${AWS_ENDPOINT_URL}${path}`);
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
