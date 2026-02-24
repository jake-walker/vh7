import { createSelectSchema } from "drizzle-zod";
import z from "zod";
import languages from "../../languages.json";
import { IdType } from "./controller";
import * as models from "./models";

const baseDateFormat = z.iso.datetime({ local: true, offset: true });
const dateFormat = baseDateFormat.nullish().transform((val) => {
        return val === null || val === undefined ? null : new Date(val);
      });
const requiredDateFormat = baseDateFormat.transform((val) => {
  return new Date(val);
});

const baseRequestSchema = z.object({
  expires: dateFormat
    .default(() => {
      const d = new Date();
      d.setDate(d.getDate() + 60);
      return d
    })
    .refine(
      (val) => {
        if (val === null || val === undefined) return true;
        const min = new Date();
        const max = new Date();
        max.setDate(max.getDate() + 365);
        return val > min && val < max;
      },
      { message: "Expiry must be between 0 days and 1 year" },
    )
    .meta({
      description: "A date for when the item will expire. The value must be 1 year at the most (31 days for files). Set to `null` to disable expiry of this item (except for files).",
    }),
  deleteToken: z.string().max(128).nullish().meta({
    description: "An optional string that allows you to later delete the item before it expires (see the `/api/delete/{id}` route).",
    example: "Z3hH26B7djooPz2EyRYhoj8i"
  }),
  linkType: z.enum(IdType).nullish().default(() => IdType.Short).meta({
    description: "The type or algorithm to use for the generated ID of the short link.",
    example: "short",
  }),
});

const baseShortLinkRequestSchema = z.object({
  url: z.url().meta({
    example: "https://example.com",
  }),
});

export const shortLinkRequestSchema = z.object({
  ...baseShortLinkRequestSchema.shape,
  ...baseRequestSchema.shape,
});

const basePasteRequestSchema = z.object({
  code: z.string().meta({
    example: "def add(a, b):\n    return a + b",
  }),
  language: z
    .enum(languages.map((lang) => lang.id))
    .nullish()
    .meta({
      description: "If provided, the code will syntax highlighted for this language.",
      example: "python",
    }),
});

export const pasteRequestSchema = z.object({
  ...basePasteRequestSchema.shape,
  ...baseRequestSchema.shape
});

const baseUploadRequestSchema = z
  .object({
    file: z
      .file()
      .refine((val) => val.size <= 2.56e8, {
        message: "File must be less than 256 MB",
      })
      .meta({
        override: {
          type: "string",
          format: "binary",
        },
      }),
  })

export const uploadRequestSchema = z.object({
  ...baseUploadRequestSchema.shape,
  ...baseRequestSchema.shape
});

const baseEventRequestSchema = z
  .object({
    title: z.string().meta({
      description: "The title for the event.",
      example: "Coffee Morning",
    }),
    description: z.string().nullish().meta({
      example: "Join us for a delicious hot cup of joe to start your morning!",
    }),
    location: z.string().nullish().meta({
      example: "Hacker Cafe",
    }),
    startDate: requiredDateFormat
      .meta({
        description: "The date when the event starts.",
        example: "2025-08-01T09:00:00.000Z",
      }),
    endDate: dateFormat
      .meta({
        description: "An optional date for when the event ends.",
        example: "2025-08-01T10:30:00.000Z",
      }),
    allDay: z.boolean().default(false).optional(),
  })
  .refine(({ startDate, endDate }) => endDate === null || endDate === undefined || endDate > startDate, {
    error: "End date must be after start date",
  });

export const eventRequestSchema = z.object({
  ...baseEventRequestSchema.shape,
  ...baseRequestSchema.shape
});

export const deleteRequestSchema = z.object({
  deleteToken: z.string().max(128),
});

const itemResponseSchema = z.object({
  ...createSelectSchema(models.shortLinks).omit({ deleteToken: true }).shape,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  expiresAt: z.iso.datetime().nullable(),
});
export const shortLinkResponseSchema = z
  .object({
    ...createSelectSchema(models.shortLinkUrls).shape,
    ...itemResponseSchema.extend({
      type: z.literal("url"),
    }).shape,
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    expiresAt: z.iso.datetime().nullable(),
  })
  .meta({
    example: {
      id: "abcd",
      url: "https://example.com",
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-01T00:00:00.000Z",
      expiresAt: null,
      type: "url",
    },
  });
export const pasteResponseSchema = z
  .object({
    ...createSelectSchema(models.shortLinkPastes).shape,
    ...itemResponseSchema.extend({
      type: z.literal("paste"),
    }).shape,
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    expiresAt: z.iso.datetime().nullable(),
  })
  .meta({
    example: {
      id: "abcd",
      code: "def add(a, b):\n    return a + b",
      language: "python",
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-01T00:00:00.000Z",
      expiresAt: null,
      type: "paste",
    },
  });
export const uploadResponseSchema = z
  .object({
    ...createSelectSchema(models.shortLinkUploads).shape,
    ...itemResponseSchema.extend({
      type: z.literal("upload"),
    }).shape,
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    expiresAt: z.iso.datetime().nullable(),
  })
  .meta({
    example: {
      id: "abcd",
      filename: "example.pdf",
      size: 4321,
      hash: "f5b5f00366fcc0c5bcb99e592bf40da0c0c1afc806ba9377dce545fcbf61d131",
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-01T00:00:00.000Z",
      expiresAt: null,
      type: "upload",
    },
  });
export const eventResponseSchema = z
  .object({
    ...createSelectSchema(models.shortLinkEvents).shape,
    ...itemResponseSchema.extend({
      type: z.literal("event"),
    }).shape,
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    expiresAt: z.iso.datetime().nullable(),
    startDate: z.iso.datetime(),
    endDate: z.iso.datetime().nullable(),
  })
  .meta({
    example: {
      id: "abcd",
      title: "Coffee Morning",
      description: "Join us for a delicious hot cup of joe to start your morning!",
      location: "Hacker Cafe",
      startDate: "2025-08-01T09:00:00.000Z",
      endDate: "2025-08-01T10:30:00.000Z",
      allDay: false,
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-01T00:00:00.000Z",
      expiresAt: null,
      type: "event",
    },
  });
