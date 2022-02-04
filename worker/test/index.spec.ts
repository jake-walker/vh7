/* eslint-disable no-param-reassign */
import anyTest, { TestFn } from 'ava';
import { Miniflare } from 'miniflare';

const test = anyTest as TestFn<{ mf: Miniflare }>;

test.beforeEach((t) => {
  const mf = new Miniflare({
    envPath: true,
    packagePath: true,
    wranglerConfigPath: true,
    buildCommand: undefined,
  });

  t.context = { mf };
});

test('can create and use short url', async (t) => {
  const { mf } = t.context;
  const url = 'https://example.com/';

  const data = new URLSearchParams();
  data.set('url', url);

  let res = await mf.dispatchFetch('http://localhost:8787/api/shorten', {
    method: 'POST',
    body: data,
  });
  t.is(res.status, 200, 'is request successful')
  const json: any = await res.json();

  res = await mf.dispatchFetch(`http://localhost:8787/${json.id}`);
  t.is(res.status, 301, 'is redirect');
  t.is(res.headers.get('Location'), url, 'is correct url');
});

test('can create and use paste', async (t) => {
  const { mf } = t.context;
  const code = 'def add(a, b):\n    return a + b';

  const data = new URLSearchParams();
  data.set('code', code);

  let res = await mf.dispatchFetch('http://localhost:8787/api/paste', {
    method: 'POST',
    body: data,
  });
  t.is(res.status, 200, 'is request successful');
  const json: any = await res.json();

  res = await mf.dispatchFetch(`http://localhost:8787/${json.id}`);
  t.is(res.status, 200, 'is successful');
  t.is(await res.text(), code, 'has correct body');
});

// test('can create and use upload', async (t) => {
//   const { mf } = t.context;
//   const file = path.join(process.cwd(), './test/VH7.png');

//   const form = new FormData();
//   form.append('file', Uint8Array.from(fs.readFileSync(file).buffer), 'VH7.png');

//   let res = await mf.dispatchFetch('http://localhost:8787/api/upload', {
//     method: 'POST',
//     body: form.getBuffer(),
//     headers: {
//       'Content-Type': 'multipart/form-data; boundary=CSC',
//       // 'Content-Length': await form.getLength(),
//     }
//   });
//   t.is(res.status, 200, 'is request successful');
//   const json: any = await res.json();

//   console.log('visitng');

//   res = await mf.dispatchFetch(`http://localhost:8787/${json.id}`);
//   t.is(res.status, 200, 'is successful');

//   console.log('calc hash');
//   const digest = await crypto.subtle.digest('SHA-256', await res.arrayBuffer());
//   const array = Array.from(new Uint8Array(digest));
//   const hash = array.map((b) => b.toString(16).padStart(2, '0')).join('');
//   t.is(hash, 'ee3572d158233ab11266af10853424440dab7c7e08a1854a63dba2cc9072ad44', 'is file correct');
// })
