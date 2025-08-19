import z from 'zod';
import languages from '../../languages.json';
import { createSelectSchema } from 'drizzle-zod';
import * as models from './models';

const baseRequestSchema = z.object({
  expires: z.number().int().positive().nullable()
    .refine((val) => {
      if (val === null || val === undefined) return true;
      const min = new Date();
      const max = new Date();
      max.setDate(max.getDate() + 365);
      return val > min.getTime() && val < max.getTime();
    }, { message: 'Expiry must be between 0 days and 1 year' })
    .default(() => {
      const d = new Date();
      d.setDate(d.getDate() + 60);
      return d.getTime();
    }).meta({
      description: "Unix timestamp for when the item will expire in milliseconds. Must be between 0 and 1 year (31 days for files).",
      example: 1735689600000
    }),
  deleteToken: z.string().max(128).optional().nullable().meta({
    description: "An optional string that allows you to later delete the item before it expires."
  }),
})

const baseShortLinkRequestSchema = z.object({
  url: z.url().meta({
    example: "https://example.com"
  }),
});

export const shortLinkRequestSchema = baseShortLinkRequestSchema.and(baseRequestSchema);

const basePasteRequestSchema = z.object({
  code: z.string().meta({
    example: "def add(a, b):\n    return a + b"
  }),
  language: z.string().optional().nullable().refine((val) => {
    if (val === null || val === undefined) return true;
    return languages.map((lang) => lang.id).includes(val);
  }, { message: 'Language ID not supported' }).meta({
    description: "If provided, the code will syntax highlighted for this language.",
    example: "python"
  }),
});

export const pasteRequestSchema = basePasteRequestSchema.and(baseRequestSchema);

const baseUploadRequestSchema = z.object({
  file: z.instanceof(File).refine((val) => val.size <= 2.56e+8, {
    message: 'File must be less than 256 MB',
  }).meta({
    override: {
      type: "string",
      format: "binary"
    }
  }),
}).and(baseRequestSchema);

export const uploadRequestSchema = baseUploadRequestSchema.and(baseRequestSchema);

export const deleteRequestSchema = z.object({
  deleteToken: z.string().max(128),
});

const itemResponseSchema = createSelectSchema(models.shortLinks).omit({ deleteToken: true });
export const shortLinkResponseSchema = z.object({
  ...createSelectSchema(models.shortLinkUrls).shape,
  ...itemResponseSchema.shape
}).meta({
  example: {
    id: "abcd",
    url: "https://example.com",
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    expiresAt: null,
    type: "url"
  }
});
export const pasteResponseSchema = z.object({
  ...createSelectSchema(models.shortLinkPastes).shape,
  ...itemResponseSchema.shape
}).meta({
  example: {
    id: "abcd",
    code: "def add(a, b):\n    return a + b",
    language: "python",
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    expiresAt: null,
    type: "paste"
  }
});
export const uploadResponseSchema = z.object({
  ...createSelectSchema(models.shortLinkUploads).shape,
  ...itemResponseSchema.shape
}).meta({
  example: {
    id: "abcd",
    filename: "example.pdf",
    size: 4321,
    hash: "f5b5f00366fcc0c5bcb99e592bf40da0c0c1afc806ba9377dce545fcbf61d131",
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    expiresAt: null,
    type: "upload"
  }
});
