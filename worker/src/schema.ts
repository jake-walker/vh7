import { z } from 'zod';
import languages from '../../languages.json';

export const ShortLinkArgs = z.object({
  url: z.string().url(),
});

export interface ShortLinkType extends z.infer<typeof ShortLinkArgs> {
  id: string
}

export const PasteArgs = z.object({
  code: z.string(),
  language: z.string().nullable().default(null).refine((val) => {
    if (val === null) return true;
    return languages.map((lang) => lang.id).includes(val);
  }, { message: 'Language ID not supported' }),
});

export interface PasteType extends z.infer<typeof PasteArgs> {
  id: string
}

export const UploadArgs = z.object({
  file: z.instanceof(File).refine((val) => val.size <= 2.56e+8, {
    message: 'File must be less than 256 MB',
  }),
});

export interface UploadType {
  id: string
  filename: string
  size: number
  hash: string
}
