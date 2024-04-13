import { z } from 'zod';
import languages from '../../languages.json';

const BaseArgs = z.object({
  expires: z.preprocess((val) => {
    if (typeof val === 'string') {
      if (val === 'null') {
        return null;
      }

      return parseInt(val, 10);
    }
    return val;
  }, z.number().int().positive().nullish()
    .refine((val) => {
      if (val === null || val === undefined) return true;
      const min = new Date();
      const max = new Date();
      max.setDate(max.getDate() + 365);
      return val > min.getTime() && val < max.getTime();
    }, { message: 'Expires must be between 0 days and 1 year' })
    .default(() => {
      const d = new Date();
      d.setDate(d.getDate() + 60);
      return d.getTime();
    })),
  deleteToken: z.string().max(128).optional(),
});

const BaseShortLinkArgs = z.object({
  url: z.string().url(),
});

export const ShortLinkArgs = BaseShortLinkArgs.and(BaseArgs);

const BasePasteArgs = z.object({
  code: z.string(),
  language: z.preprocess((val) => {
    if (val === 'null') {
      return null;
    }
    return val;
  }, z.string().nullable().default(null).refine((val) => {
    if (val === null) return true;
    return languages.map((lang) => lang.id).includes(val);
  }, { message: 'Language ID not supported' })),
});

export const PasteArgs = BasePasteArgs.and(BaseArgs);

const BaseUploadArgs = z.object({
  file: z.instanceof(File).refine((val) => val.size <= 2.56e+8, {
    message: 'File must be less than 256 MB',
  }),
}).and(BaseArgs);

export const UploadArgs = BaseUploadArgs.and(BaseArgs);
