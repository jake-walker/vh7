import axios from "axios";

const apiURL = import.meta.env.PROD
  ? "https://vh7.uk/api"
  : "http://localhost:8787/api";
export const baseURL = import.meta.env.PROD
  ? "https://vh7.uk/"
  : "http://localhost:8787/";

const instance = axios.create({
  baseURL: apiURL,
});

export function shortUrl(u) {
  if (u.length < 50) {
    return u.replace("http://", "").replace("https://", "");
  }

  const uend = u.slice(u.length - 15);
  const ustart = u.replace("http://", "").replace("https://", "").substr(0, 32);
  return ustart + "..." + uend;
}

function parseExpiry(expiryDays) {
  let expiryDate = null;
  expiryDays = parseInt(expiryDays);
  if (expiryDays > 0) {
    expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);
    expiryDate = expiryDate.getTime();
  }

  return expiryDate;
}

export async function shorten(url, expiryDays, deletable) {
  const expires = parseExpiry(expiryDays);

  const res = await instance.post(
    "/shorten",
    {
      url,
      expires,
      deleteToken: deletable ? crypto.randomUUID() : null,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return res.data;
}

export async function paste(code, language, expiryDays, deletable) {
  const expires = parseExpiry(expiryDays);

  const res = await instance.post(
    "/paste",
    {
      code,
      language,
      expires,
      deleteToken: deletable ? crypto.randomUUID() : null,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return res.data;
}

export async function upload(file, expiryDays, deletable) {
  const expires = parseExpiry(expiryDays);

  const form = new FormData();
  form.append("file", file);
  form.append("expires", expires);
  if (deletable) {
    form.append("deleteToken", crypto.randomUUID());
  }

  const res = await instance.post("/upload", form);
  return res.data;
}

export async function deleteWithToken(id, token) {
  const res = await instance.delete(
    `/delete/${id}`,
    {
      deleteToken: token,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return res.data;
}

export async function info(id) {
  const res = await instance.get(`/info/${id}`);
  return res.data;
}
