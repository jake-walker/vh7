# VH7
A free and open source URL shortening, file sharing and pastebin service.

## Overview

VH7 is a small project offering a free URL shortening, file sharing and pastebin service. Unlike other major URL shorteners, VH7 offers shorter links (4 characters) as well as the ability to have a short link for files and code snippets under the same roof.

VH7 utilises [Cloudflare Workers](https://workers.cloudflare.com/) for hosting the API, [Cloudflare Pages](https://pages.cloudflare.com/) for hosting the frontend, [Cloudflare Workers KV](https://www.cloudflare.com/en-gb/products/workers-kv/) for storing data and [AWS S3](https://aws.amazon.com/s3/) for storing files.

## Getting Started

First, clone this repository and run `yarn --dev` to install the dependendies for all the sub-projects.

### Worker

Next, enter the `worker` folder and create a new `.env` file containing the following:

```
AWS_ACCESS_KEY_ID=[aws key here]
AWS_SECRET_ACCESS_KEY=[aws key here]
AWS_DEFAULT_REGION=[aws region here, or leave blank]
AWS_ENDPOINT_URL=[aws endpoint url]
AWS_S3_BUCKET=[s3 bucket name]
```

Then run `yarn run dev` to start a local development server.

### Frontend

To start the frontend, enter the `app` folder and run `yarn run dev`.

Visit `http://localhost:3000` in your web browser.
