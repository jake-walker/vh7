import { env, SELF } from "cloudflare:test";
import { drizzle } from "drizzle-orm/d1";
import { beforeAll, describe, expect, test } from "vitest";
import { sha256 } from "../src/controller";
import * as models from "../src/models";
import { doesExist } from "./util";

beforeAll(async () => {
  const d = drizzle(env.DB);

  // clear tables
  await d.delete(models.shortLinkUrls);
  await d.delete(models.shortLinkPastes);
  await d.delete(models.shortLinkUploads);
  await d.delete(models.shortLinkEvents);
  await d.delete(models.shortLinks);

  // insert test links
  await d
    .insert(models.shortLinks)
    .values([
      {
        id: "AAAA",
        type: "url",
        createdAt: new Date(2024, 0, 1),
        updatedAt: new Date(2024, 0, 1),
      },
      {
        id: "BBBB",
        type: "paste",
        createdAt: new Date(2024, 0, 1),
        updatedAt: new Date(2024, 0, 1),
      },
      {
        id: "CCCC",
        type: "upload",
        createdAt: new Date(2024, 0, 1),
        updatedAt: new Date(2024, 0, 1),
      },
      {
        id: "DDDD",
        type: "url",
        createdAt: new Date(2024, 0, 1),
        updatedAt: new Date(2024, 0, 1),
        expiresAt: new Date(2000, 0, 1),
      },
      {
        id: "EEEE",
        type: "event",
        createdAt: new Date(2024, 0, 1),
        updatedAt: new Date(2024, 0, 1),
      },
      {
        id: "1111",
        type: "upload",
        createdAt: new Date(2024, 0, 1),
        updatedAt: new Date(2024, 0, 1),
        deleteToken: "keyboardcat",
      },
      {
        id: "2222",
        type: "url",
        createdAt: new Date(2024, 0, 1),
        updatedAt: new Date(2024, 0, 1),
        deleteToken: "keyboardcat",
      },
    ])
    .run();
  await d.insert(models.shortLinkUrls).values([
    { id: "AAAA", url: "https://example.com" },
    { id: "DDDD", url: "https://example.com" },
    { id: "2222", url: "https://example.com" },
  ]);
  await d.insert(models.shortLinkPastes).values({ id: "BBBB", code: 'println!("Hello, World!")', language: "rust" });

  const file = new File(["Hello, World!"], "hello.txt", {
    type: "text/plain",
  });

  await d.insert(models.shortLinkUploads).values([
    {
      id: "CCCC",
      filename: file.name,
      hash: await sha256(file),
      size: file.size,
    },
    {
      id: "1111",
      filename: file.name,
      hash: await sha256(file),
      size: file.size,
    },
  ]);

  await d.insert(models.shortLinkEvents).values([
    {
      id: "EEEE",
      title: "My Event",
      startDate: new Date(2025, 0, 1, 0, 0, 0, 0),
      endDate: null,
      description: null,
      location: null,
      allDay: false,
    },
  ]);

  await env.UPLOADS.put("CCCC", file);
});

describe("API", () => {
  describe("create", () => {
    test("url", async () => {
      const res = await SELF.fetch("http://vh7.uk/api/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: "https://example.com",
        }),
      });

      expect(res.status).toBe(200);
      const json: unknown = await res.json();
      expect(json).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          type: "url",
          url: "https://example.com",
          createdAt: expect.any(String),
          expiresAt: expect.any(String),
          updatedAt: expect.any(String),
          deleteToken: null,
        }),
      );
      // biome-ignore lint/suspicious/noExplicitAny: type checking is done above
      expect((json as any).id).toHaveLength(4);
    });

    test("url long type", async () => {
      const res = await SELF.fetch("http://vh7.uk/api/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: "https://example.com",
          linkType: "long"
        }),
      });

      expect(res.status).toBe(200);
      const json: unknown = await res.json();
      expect(json).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          type: "url",
          url: "https://example.com",
          createdAt: expect.any(String),
          expiresAt: expect.any(String),
          updatedAt: expect.any(String),
          deleteToken: null,
        }),
      );
      // biome-ignore lint/suspicious/noExplicitAny: type checking is done above
      expect((json as any).id).toHaveLength(9);
    });

    test("paste", async () => {
      const res = await SELF.fetch("http://vh7.uk/api/paste", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: "mycode",
        }),
      });

      expect(res.status).toBe(200);
      const json: unknown = await res.json();
      expect(json).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          type: "paste",
          code: "mycode",
          language: null,
          createdAt: expect.any(String),
          expiresAt: expect.any(String),
          updatedAt: expect.any(String),
          deleteToken: null,
        }),
      );
    });

    test("event", async () => {
      const res = await SELF.fetch("http://vh7.uk/api/event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "My Event",
          startDate: "2025-01-01T00:00:00Z",
        }),
      });

      expect(res.status).toBe(200);
      const json: unknown = await res.json();
      expect(json).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          type: "event",
          title: "My Event",
          startDate: "2025-01-01T00:00:00.000Z",
          endDate: null,
          description: null,
          location: null,
          allDay: false,
          createdAt: expect.any(String),
          expiresAt: expect.any(String),
          updatedAt: expect.any(String),
          deleteToken: null,
        }),
      );
    });

    test("upload", async () => {
      const data = new FormData();
      data.append(
        "file",
        new Blob(["Hello, World!"], {
          type: "text/plain",
        }),
        "test.txt",
      );

      const res = await SELF.fetch("http://vh7.uk/api/upload", {
        method: "POST",
        body: data,
      });

      expect(res.status).toBe(200);
      const json: unknown = await res.json();
      expect(json).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          type: "upload",
          filename: "test.txt",
          size: 13,
          hash: "dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f",
          createdAt: expect.any(String),
          expiresAt: expect.any(String),
          updatedAt: expect.any(String),
          deleteToken: null,
        }),
      );
    });
  });

  test.each([
    { id: "AAAA", expectedData: { type: "url", url: "https://example.com" } },
    { id: "BBBB", expectedData: { type: "paste", code: 'println!("Hello, World!")', language: "rust" } },
    {
      id: "CCCC",
      expectedData: {
        type: "upload",
        filename: "hello.txt",
        size: 13,
        hash: "dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f",
      },
    },
    {
      id: "EEEE",
      expectedData: {
        type: "event",
        title: "My Event",
        startDate: "2025-01-01T00:00:00.000Z",
        endDate: null,
        description: null,
        location: null,
        allDay: false,
      },
    },
  ])("get info $expectedData.type", async ({ id, expectedData }) => {
    const res = await SELF.fetch(`http://vh7.uk/api/info/${id}`);

    expect(res.status).toBe(200);
    const json: unknown = await res.json();
    expect(json).toEqual({
      id,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
      expiresAt: null,
      ...expectedData,
    });
  });

  test.each([
    { id: "DDDD", type: "expired" },
    { id: "ZZZZ", type: "non-existant" },
  ])("get info $type", async ({ id }) => {
    const res = await SELF.fetch(`http://vh7.uk/api/info/${id}`);
    expect(res.status).toBe(404);
  });

  test.skip.each([
    { id: "AAAA", type: "url" },
    { id: "BBBB", type: "paste" },
    { id: "CCCC", type: "upload" },
    { id: "EEEE", type: "event" },
    { id: "ZZZZ", type: "non-existant" },
  ])("get indirect $type", async ({ id }) => {
    const res = await SELF.fetch(`http://vh7.uk/${id}`);

    expect(res.status).toBe(200);
    expect(res.headers).toHaveProperty("Content-Type", "text/html");
  });

  test.skip("get direct url", async () => {
    const res = await SELF.fetch("http://vh7.uk/AAAA", {
      headers: {
        "User-Agent": "curl/8.1.2",
      },
    });

    expect(res.status).toBe(301);
    expect(res.headers.get("location")).toBe("https://example.com");
  });

  test("get direct paste", async () => {
    const res = await SELF.fetch("http://vh7.uk/BBBB", {
      headers: {
        "User-Agent": "curl/8.1.2",
      },
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/plain");
    expect(res.headers.get("Content-Disposition")).toBe('attachment; filename="vh7-paste-BBBB.rs"');
    expect(await res.text()).toBe('println!("Hello, World!")');
  });

  test("get direct event", async () => {
    const res = await SELF.fetch("http://vh7.uk/EEEE", {
      headers: {
        "User-Agent": "curl/8.1.2",
      },
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/calendar");
    expect(res.headers.get("Content-Disposition")).toBe('attachment; filename="vh7-event-EEEE.ics"');
    expect(await res.text()).toBe(
      "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Vh7Events//EN\nCALSCALE:GREGORIAN\nBEGIN:VEVENT\nUID:EEEE@vh7.uk\nDTSTAMP:20240101T000000Z\nDTSTART:20250101T000000Z\nDTEND:20250101T010000Z\nSUMMARY:My Event\nEND:VEVENT\nEND:VCALENDAR".replaceAll(
        "\n",
        "\r\n",
      ),
    );
  });

  test("get direct upload", async () => {
    const res = await SELF.fetch("http://vh7.uk/CCCC", {
      headers: {
        "User-Agent": "curl/8.1.2",
      },
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/force-download");
    expect(res.headers.get("Content-Transfer-Encoding")).toBe("binary");
    expect(res.headers.get("Content-Disposition")).toBe('attachment; filename="hello.txt"');
    expect(await res.text()).toBe("Hello, World!");
  });

  test.each([
    { id: "DDDD", type: "expired" },
    { id: "ZZZZ", type: "non-existant" },
  ])("get direct $type", async ({ id }) => {
    const res = await SELF.fetch(`http://vh7.uk/${id}`, {
      headers: {
        "User-Agent": "curl/8.1.2",
      },
    });
    expect(res.status).toBe(404);
  });

  describe("delete", () => {
    test("delete with valid delete token", async () => {
      expect(await doesExist("1111")).toBe(true);

      const res = await SELF.fetch("http://vh7.uk/api/delete/1111?deleteToken=keyboardcat", {
        method: "DELETE",
      });
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({
        status: 200,
        deleted: "1111",
      });

      expect(await doesExist("1111")).toBe(false);
    });

    test("delete with invalid delete token", async () => {
      expect(await doesExist("2222")).toBe(true);

      const res = await SELF.fetch("http://vh7.uk/api/delete/2222?deleteToken=hi", {
        method: "DELETE",
      });
      expect(res.status).toBe(403);

      expect(await doesExist("2222")).toBe(true);
    });

    test("non-deletable", async () => {
      expect(await doesExist("AAAA")).toBe(true);

      const res = await SELF.fetch("http://vh7.uk/api/delete/AAAA?deleteToken=keyboardcat", {
        method: "DELETE",
      });
      expect(res.status).toBe(403);

      expect(await doesExist("AAAA")).toBe(true);
    });
  });

  describe("create with delete token", () => {
    test("url", async () => {
      const res = await SELF.fetch("http://vh7.uk/api/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: "https://example.com",
          deleteToken: "keyboardcat",
        }),
      });

      expect(res.status).toBe(200);
      const json: unknown = await res.json();
      expect(json).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          type: "url",
          url: "https://example.com",
          createdAt: expect.any(String),
          expiresAt: expect.any(String),
          updatedAt: expect.any(String),
          deleteToken: "keyboardcat",
        }),
      );
    });

    test("paste", async () => {
      const res = await SELF.fetch("http://vh7.uk/api/paste", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: "mycode",
          deleteToken: "keyboardcat",
        }),
      });

      expect(res.status).toBe(200);
      const json: unknown = await res.json();
      expect(json).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          type: "paste",
          code: "mycode",
          language: null,
          createdAt: expect.any(String),
          expiresAt: expect.any(String),
          updatedAt: expect.any(String),
          deleteToken: "keyboardcat",
        }),
      );
    });

    test("event", async () => {
      const res = await SELF.fetch("http://vh7.uk/api/event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "My Event",
          startDate: "2025-01-01T00:00:00Z",
          deleteToken: "keyboardcat",
        }),
      });

      expect(res.status).toBe(200);
      const json: unknown = await res.json();
      expect(json).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          type: "event",
          title: "My Event",
          startDate: "2025-01-01T00:00:00.000Z",
          endDate: null,
          description: null,
          location: null,
          allDay: false,
          createdAt: expect.any(String),
          expiresAt: expect.any(String),
          updatedAt: expect.any(String),
          deleteToken: "keyboardcat",
        }),
      );
    });

    test("upload", async () => {
      const data = new FormData();
      data.append(
        "file",
        new Blob(["Hello, World!"], {
          type: "text/plain",
        }),
        "test.txt",
      );
      data.set("deleteToken", "keyboardcat");

      const res = await SELF.fetch("http://vh7.uk/api/upload", {
        method: "POST",
        body: data,
      });

      expect(res.status).toBe(200);
      const json: unknown = await res.json();
      expect(json).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          type: "upload",
          filename: "test.txt",
          size: 13,
          hash: "dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f",
          createdAt: expect.any(String),
          expiresAt: expect.any(String),
          updatedAt: expect.any(String),
          deleteToken: "keyboardcat",
        }),
      );
    });
  });
});
