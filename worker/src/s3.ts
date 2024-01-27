import { AwsClient } from 'aws4fetch';

export type S3Configuration = {
  accessKeyId: string,
  secretAccessKey: string,
  region: string,
  endpointUrl: string,
  bucket: string
};

async function makeRequest(config: S3Configuration, path: string = '/', options: RequestInit | Request = {}) {
  const client = new AwsClient({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    region: config.region,
  });

  const url = new URL(`${config.endpointUrl}/${config.bucket}${path}`);
  const signedRequest = await client.sign(url, {
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

export async function getObjectMetadata(config: S3Configuration, filename: string) {
  const req = makeRequest(config, `/${filename}`, {
    method: 'HEAD',
  });

  return req;
}

export async function getObject(config: S3Configuration, filename: string) {
  const req = makeRequest(config, `/${filename}`);
  return req;
}

export async function putObject(config: S3Configuration, filename: string, file: File) {
  const req = makeRequest(config, `/${filename}`, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
      'Content-Length': file.size.toString(),
    },
  });

  return req;
}
