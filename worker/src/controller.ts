import { customAlphabet } from 'nanoid/async';
import { putObject } from './s3';
import { PasteType, ShortLinkType, UploadType } from './schema';
import { get, save } from './storage';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 4);

async function sha256(file: File) {
  const fileData = await file.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', fileData);
  const array = Array.from(new Uint8Array(digest));
  return array.map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function generateId(): Promise<string> {
  for (let i = 0; i < 5; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const id = await nanoid();
    // eslint-disable-next-line no-await-in-loop
    const value = await get(id);
    if (value === null) {
      return id;
    }
  }

  throw new Error('Could not generate ID');
}

export async function createShortUrl(url: string): Promise<ShortLinkType> {
  const id = await generateId();

  await save(id, {
    type: 'url:1',
    url,
    created: new Date(),
  });

  return {
    id,
    url,
  };
}

export async function createPaste(code: string, language: string | null): Promise<PasteType> {
  const id = await generateId();

  await save(id, {
    type: 'paste:1',
    code,
    language,
    created: new Date(),
  });

  return {
    id,
    language,
    code,
  };
}

export async function createUpload(file: File): Promise<UploadType> {
  const id = await generateId();
  const hash = await sha256(file);

  const res = await putObject(id, file);
  if (res.status !== 200) {
    throw new Error(`Failed to put object (status=${res.status}, msg=${await res.text()})`);
  }

  await save(id, {
    type: 'upload:1',
    size: file.size,
    filename: file.name,
    hash,
    created: new Date(),
  });

  return {
    id,
    size: file.size,
    filename: file.name,
    hash,
  };
}

export async function lookup(id: string): Promise<any> {
  if (!/[a-zA-Z0-9]{4}/.test(id)) {
    return null;
  }

  const data = await get(id);
  if (data === null) {
    return null;
  }

  return {
    id,
    ...data,
  };
}
