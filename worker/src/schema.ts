import { createSelectSchema } from "drizzle-zod";
import z from "zod";
import languages from "../../languages.json";
import * as models from "./models";

const baseRequestSchema = z.object({
  expires: z.optional(z.coerce
    .number()
    .int()
    .positive()
    .nullable()
    .refine(
      (val) => {
        if (val === null || val === undefined) return true;
        const min = new Date();
        const max = new Date();
        max.setDate(max.getDate() + 365);
        return val > min.getTime() && val < max.getTime();
      },
      { message: "Expiry must be between 0 days and 1 year" },
    )
    .default(() => {
      const d = new Date();
      d.setDate(d.getDate() + 60);
      return d.getTime();
    }))
    .meta({
      description:
        "Unix timestamp for when the item will expire in milliseconds. Must be between 0 and 1 year (31 days for files).",
      example: 1735689600000,
    }),
  deleteToken: z.string().max(128).optional().nullable().meta({
    description: "An optional string that allows you to later delete the item before it expires.",
  }),
});

const baseShortLinkRequestSchema = z.object({
  url: z.url().meta({
    example: "https://example.com",
  }),
});

export const shortLinkRequestSchema = baseShortLinkRequestSchema.and(baseRequestSchema);

const basePasteRequestSchema = z.object({
  code: z.string().meta({
    example: "def add(a, b):\n    return a + b",
  }),
  language: z
    .enum(languages.map((lang) => lang.id))
    .nullable()
    .optional()
    .meta({
      description: "If provided, the code will syntax highlighted for this language.",
      example: "python",
    }),
});

export const pasteRequestSchema = basePasteRequestSchema.and(baseRequestSchema);

const baseUploadRequestSchema = z
  .object({
    file: z
      .instanceof(File)
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
  .and(baseRequestSchema);

export const uploadRequestSchema = baseUploadRequestSchema.and(baseRequestSchema);

const baseEventRequestSchema = z.object({
  title: z.string().meta({
    example: "My event"
  }),
  description: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
  allDay: z.boolean().default(false).optional()
}).refine(({ startDate, endDate }) => endDate === null || endDate === undefined || endDate > startDate, { error: "End date must be after start date" });
export const eventRequestSchema = baseEventRequestSchema.and(baseRequestSchema);

export const deleteRequestSchema = z.object({
  deleteToken: z.string().max(128),
});

const itemResponseSchema = createSelectSchema(models.shortLinks).omit({ deleteToken: true });
export const shortLinkResponseSchema = z
  .object({
    ...createSelectSchema(models.shortLinkUrls).shape,
    ...itemResponseSchema.extend({
      type: z.literal("url"),
    }).shape,
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
