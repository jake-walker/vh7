import { customAlphabet } from 'nanoid/async';
import { putObject } from './s3';
import { PasteItem, ShortLinkItem, UploadItem } from './schema';
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

export async function createShortUrl(url: string, expires: number | null): Promise<ShortLinkItem> {
  const id = await generateId();
  const item: ShortLinkItem = {
    id,
    type: 'url:1',
    created: (new Date()).getTime(),
    expires,
    data: {
      url,
    },
  };
  await save(item);
  return item;
}

export async function createPaste(code: string, language: string | null, expires: number | null):
Promise<PasteItem> {
  const id = await generateId();
  const item: PasteItem = {
    id,
    type: 'paste:1',
    created: (new Date()).getTime(),
    expires,
    data: {
      code,
      language,
    },
  };
  await save(item);
  return item;
}

export async function createUpload(file: File, rawExpires: number | null): Promise<UploadItem> {
  const id = await generateId();
  const hash = await sha256(file);

  const res = await putObject(id, file);
  if (res.status !== 200) {
    throw new Error(`Failed to put object (status=${res.status}, msg=${await res.text()})`);
  }

  const maxExpiry = new Date();
  maxExpiry.setDate(maxExpiry.getDate() + 30);
  let expires = rawExpires;
  if (expires !== null && expires > maxExpiry.getTime()) {
    expires = maxExpiry.getTime();
  }

  const item: UploadItem = {
    id,
    type: 'upload:1',
    created: (new Date()).getTime(),
    expires,
    data: {
      filename: file.name,
      size: file.size,
      hash,
    },
  };
  await save(item);
  return item;
}

export async function lookup(id: string): Promise<any> {
  if (!/[a-zA-Z0-9]{4}/.test(id)) {
    return null;
  }

  return get(id);
}
