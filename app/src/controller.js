import { create } from 'axios';

const isProduction = process.env.NODE_ENV === 'production';
const apiURL = isProduction ? 'https://vh7.uk/api' : 'http://localhost:8787/api';
export const baseURL = isProduction ? 'https://vh7.uk/' : 'http://localhost:8787/';

const instance = create({
  baseURL: apiURL,
});

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
