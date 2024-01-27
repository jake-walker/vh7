import { getBindingsProxy } from 'wrangler';
import { drizzle } from 'drizzle-orm/d1';
import app, { type Bindings } from './index';
import * as models from './models';
import { S3Configuration, putObject } from './s3';
import { sha256 } from './controller';

const { bindings } = await getBindingsProxy();
const appEnv: Bindings = {
  DB: bindings.DB as D1Database,
  VH7_ENV: 'testing',
  S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID || 'minioadmin',
  S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY || 'minioadmin',
  S3_REGION: process.env.S3_REGION || 'eu-west-1',
  S3_ENDPOINT_URL: process.env.S3_ENDPOINT_URL || 'http://localhost:9000',
  S3_BUCKET: process.env.S3_BUCKET || 'vh7-uploads',
};

beforeAll(async () => {
  const { DB } = appEnv;
  const d = drizzle(DB);

  // clear tables
  await d.delete(models.shortLinkUrls);
  await d.delete(models.shortLinkPastes);
  await d.delete(models.shortLinkUploads);
  await d.delete(models.shortLinks);

  // insert test links
  await d.insert(models.shortLinks).values([
    {
      id: 'AAAA', type: 'url', createdAt: new Date(2024, 0, 1), updatedAt: new Date(2024, 0, 1),
    },
    {
      id: 'BBBB', type: 'paste', createdAt: new Date(2024, 0, 1), updatedAt: new Date(2024, 0, 1),
    },
    {
      id: 'CCCC', type: 'upload', createdAt: new Date(2024, 0, 1), updatedAt: new Date(2024, 0, 1),
    },
    {
      id: 'DDDD', type: 'url', createdAt: new Date(2024, 0, 1), updatedAt: new Date(2024, 0, 1), expiresAt: new Date(2000, 0, 1),
    },
  ]).run();
  await d.insert(models.shortLinkUrls).values([
    { id: 'AAAA', url: 'https://example.com' },
    { id: 'DDDD', url: 'https://example.com' },
  ]);
  await d.insert(models.shortLinkPastes).values({ id: 'BBBB', code: 'println!("Hello, World!")', language: 'rust' });

  const file = new File(['Hello, World!'], 'hello.txt', {
    type: 'text/plain',
  });

  await d.insert(models.shortLinkUploads).values({
    id: 'CCCC', filename: file.name, hash: await sha256(file), size: file.size,
  });

  const s3Config: S3Configuration = {
    accessKeyId: appEnv.S3_ACCESS_KEY_ID,
    secretAccessKey: appEnv.S3_SECRET_ACCESS_KEY,
    bucket: appEnv.S3_BUCKET,
    endpointUrl: appEnv.S3_ENDPOINT_URL,
    region: appEnv.S3_REGION,
  };
  await putObject(s3Config, 'CCCC', file);
});

describe('API', () => {
  describe('create', () => {
    test('url', async () => {
      const data = new FormData();
      data.set('url', 'https://example.com');

      const res = await app.request('http://vh7.uk/api/shorten', {
        method: 'POST',
        body: data,
      }, appEnv);

      expect(res.status).toBe(200);
      const json: any = await res.json();
      expect(json).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          type: 'url',
          url: 'https://example.com',
          createdAt: expect.any(String),
          expiresAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      );
    });

    test('paste', async () => {
      const data = new FormData();
      data.set('code', 'mycode');

      const res = await app.request('http://vh7.uk/api/paste', {
        method: 'POST',
        body: data,
      }, appEnv);

      expect(res.status).toBe(200);
      const json: any = await res.json();
      expect(json).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          type: 'paste',
          code: 'mycode',
          language: null,
          createdAt: expect.any(String),
          expiresAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      );
    });

    test('upload', async () => {
      const data = new FormData();
      data.append('file', new Blob(['Hello, World!'], {
        type: 'text/plain',
      }), 'test.txt');

      const res = await app.request('http://vh7.uk/api/upload', {
        method: 'POST',
        body: data,
      }, appEnv);

      expect(res.status).toBe(200);
      const json: any = await res.json();
      expect(json).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          type: 'upload',
          filename: 'test.txt',
          size: 13,
          hash: 'dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f',
          createdAt: expect.any(String),
          expiresAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      );
    });
  });

  test.each([
    { id: 'AAAA', expectedData: { type: 'url', url: 'https://example.com' } },
    { id: 'BBBB', expectedData: { type: 'paste', code: 'println!("Hello, World!")', language: 'rust' } },
    {
      id: 'CCCC',
      expectedData: {
        type: 'upload', filename: 'hello.txt', size: 13, hash: 'dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f',
      },
    },
  ])('get info $expectedData.type', async ({ id, expectedData }) => {
    const res = await app.request(`http://vh7.uk/api/info/${id}`, {}, appEnv);

    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json).toEqual({
      id,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      expiresAt: null,
      ...expectedData,
    });
  });

  test.each([
    { id: 'DDDD', type: 'expired' },
    { id: 'ZZZZ', type: 'non-existant' },
  ])('get info $type', async ({ id }) => {
    const res = await app.request(`http://vh7.uk/api/info/${id}`, {}, appEnv);
    expect(res.status).toBe(404);
  });

  test.each([
    { id: 'AAAA', type: 'url' },
    { id: 'BBBB', type: 'paste' },
    { id: 'CCCC', type: 'upload' },
    { id: 'ZZZZ', type: 'non-existant' },
  ])('get indirect $type', async ({ id }) => {
    const res = await app.request(`http://vh7.uk/${id}`, {}, appEnv);

    expect(res.status).toBe(301);
    expect(res.headers.get('location')).toBe(`http://localhost:3000/view/${id}`);
  });

  test('get direct url', async () => {
    const res = await app.request('http://vh7.uk/AAAA', {
      headers: {
        'User-Agent': 'curl/8.1.2',
      },
    }, appEnv);

    expect(res.status).toBe(301);
    expect(res.headers.get('location')).toBe('https://example.com');
  });

  test('get direct paste', async () => {
    const res = await app.request('http://vh7.uk/BBBB', {
      headers: {
        'User-Agent': 'curl/8.1.2',
      },
    }, appEnv);

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('text/plain');
    expect(res.headers.get('Content-Disposition')).toBe('attachment; filename="vh7-paste-BBBB.txt"');
    expect(await res.text()).toBe('println!("Hello, World!")');
  });

  test('get direct upload', async () => {
    const res = await app.request('http://vh7.uk/CCCC', {
      headers: {
        'User-Agent': 'curl/8.1.2',
      },
    }, appEnv);

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/force-download');
    expect(res.headers.get('Content-Transfer-Encoding')).toBe('binary');
    expect(res.headers.get('Content-Disposition')).toBe('attachment; filename="hello.txt"');
    expect(await res.text()).toBe('Hello, World!');
  });

  test.each([
    { id: 'DDDD', type: 'expired' },
    { id: 'ZZZZ', type: 'non-existant' },
  ])('get direct $type', async ({ id }) => {
    const res = await app.request(`http://vh7.uk/${id}`, {
      headers: {
        'User-Agent': 'curl/8.1.2',
      },
    }, appEnv);
    expect(res.status).toBe(404);
  });
});
