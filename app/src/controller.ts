import createClient from "openapi-fetch";
import type { ZodType } from "zod";
import type { operations, paths } from "./api.g";

const baseUrl = import.meta.env.MODE === "development" ? "http://localhost:8787" : "";

const client = createClient<paths>({ baseUrl });

type LinkType = NonNullable<operations["postApiShorten"]["requestBody"]>["content"]["application/json"]["linkType"];

export function idToUrl(id: string) {
  const u = new URL(import.meta.env.MODE !== "development" ? window.location.href : baseUrl);
  return `${u.protocol}//${u.hostname}${u.port ? `:${u.port}` : ""}/${encodeURIComponent(id)}`;
}

export const zodFormValidator = (schema: ZodType) => (value: unknown) => {
  const result = schema.safeParse(value);

  if (result.success) {
    return null;
  }

  return result.error.issues.map((issue) => issue.message).join(", ");
};

export function shortUrl(u: string) {
  if (u.length < 50) {
    return u.replace("http://", "").replace("https://", "");
  }

  const uend = u.slice(u.length - 15);
  const ustart = u.replace("http://", "").replace("https://", "").substring(0, 32);
  return `${ustart}...${uend}`;
}

function parseExpiry(v: string | null): string | null {
  if (v === null) return null;

  let expiryDate = null;
  const expiryDays = parseInt(v, 10);
  if (expiryDays > 0) {
    expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);
  }

  return expiryDate?.toISOString() ?? null;
}

export async function shorten(url: string, expiryDays: string | null, deletable: boolean, linkType: LinkType) {
  const expires = parseExpiry(expiryDays);

  const { data, error } = await client.POST("/api/shorten", {
    body: {
      url,
      expires,
      deleteToken: deletable ? crypto.randomUUID() : null,
      linkType
    },
  });

  if (error !== undefined) {
    console.error("Failed to create short URL:", error);
    throw new Error(`Failed to create short URL: ${error}`);
  }

  return data;
}

export async function paste(code: string, language: NonNullable<operations["postApiPaste"]["requestBody"]>["content"]["application/json"]["language"], expiryDays: string | null, deletable: boolean, linkType: LinkType) {
  const expires = parseExpiry(expiryDays);

  const { data, error } = await client.POST("/api/paste", {
    body: {
      code,
      language,
      expires,
      deleteToken: deletable ? crypto.randomUUID() : null,
      linkType
    },
  });

  if (error !== undefined) {
    console.error("Failed to create paste:", error);
    throw new Error(`Failed to create paste: ${error}`);
  }

  return data;
}

export async function upload(file: File, expiryDays: string | null, deletable: boolean, linkType: LinkType) {
  const expires = parseExpiry(expiryDays);

  const form = new FormData();
  form.append("file", file);

  if (linkType !== null && linkType !== undefined) {
    form.append("linkType", linkType);
  }

  if (expires !== null) {
    form.append("expires", expires.toString());
  }

  if (deletable) {
    form.append("deleteToken", crypto.randomUUID());
  }

  const res = await fetch(`${baseUrl}/api/upload`, {
    method: "POST",
    body: form,
  });

  return (await res.json()) as operations["postApiUpload"]["responses"][200]["content"]["application/json"];
}

export async function deleteWithToken(id: string, token: string) {
  const { data, error } = await client.DELETE("/api/delete/{id}", {
    params: {
      path: { id },
      query: {
        deleteToken: token,
      },
    },
  });

  if (error !== undefined) {
    console.error("Failed to delete:", error);
    throw new Error(`Failed to delete: ${error}`);
  }

  return data;
}

export async function info(id: string) {
  const { data, error, response } = await client.GET("/api/info/{id}", {
    params: {
      path: { id },
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (error !== undefined) {
    console.error("Failed to get info:", error);
    throw new Error(`Failed to get info: ${error}`);
  }

  return data;
}
