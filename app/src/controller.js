import { create } from 'axios';

const isProduction = process.env.NODE_ENV === 'production';
const apiURL = isProduction ? 'https://vh7.uk/api' : 'http://localhost:8787/api';
export const baseURL = isProduction ? 'https://vh7.uk/' : 'http://localhost:8787/';

const instance = create({
  baseURL: apiURL,
});

export function shortUrl(u) {
  if (u.length < 50) {
    return u.replace('http://', '').replace('https://', '');
  }

  const uend = u.slice(u.length - 15);
  const ustart = u.replace('http://', '').replace('https://', '').substr(0, 32);
  return ustart + '...' + uend;
}

function parseExpiry(expiryDays) {
  let expiryDate = null;
  console.log("days", expiryDays);
  expiryDays = parseInt(expiryDays);
  console.log("days", expiryDays);
  if (expiryDays > 0) {
    expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);
    expiryDate = expiryDate.getTime();
  }

  return expiryDate;
}

export async function shorten(url, expiryDays) {
  const expires = parseExpiry(expiryDays);

  const res = await instance.post('/shorten', {
    url,
    expires
  });
  return res.data;
}

export async function paste(code, language, expiryDays) {
  const expires = parseExpiry(expiryDays);

  const res = await instance.post('/paste', {
    code,
    language,
    expires
  });
  return res.data;
}

export async function upload(file, expiryDays) {
  const expires = parseExpiry(expiryDays);

  const form = new FormData();
  form.append('file', file);
  form.append('expires', expires);

  const res = await instance.post('/upload', form);
  return res.data;
}

export async function info(id) {
  const res = await instance.get(`/info/${id}`);
  return res.data;
}
