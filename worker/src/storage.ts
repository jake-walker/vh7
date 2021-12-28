import Korma from 'korma-kv';
import CloudflareAdapter from 'korma-kv/dist/adapters/cloudflare';

const adapter = new CloudflareAdapter(VH7);

export enum KVType {
  ShortLink = 'shortlink',
}

export const korma = new Korma.Korma(adapter);

export interface ShortLink {
  url: string
}
