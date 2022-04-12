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

export async function shorten(url) {
  const res = await instance.post('/shorten', {
    url,
  });
  return res.data;
}

export async function paste(code, language) {
  const res = await instance.post('/paste', {
    code,
    // language,
  });
  return res.data;
}

export async function upload(file) {
  const form = new FormData();
  form.append('file', file);

  const res = await instance.post('/upload', form);
  return res.data;
}

export async function info(id) {
  const res = await instance.get(`/info/${id}`);
  return res.data;
}
