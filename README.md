# VH7
A free and open source URL shortening, file sharing and pastebin service.

## Overview

VH7 is a small project offering a free URL shortening, file sharing and pastebin service. Unlike other major URL shorteners, VH7 offers shorter links (4 characters) as well as the ability to have a short link for files and code snippets under the same roof.

VH7 utilises [Cloudflare Workers](https://workers.cloudflare.com/) for hosting the API, [Cloudflare Pages](https://pages.cloudflare.com/) for hosting the frontend, [Cloudflare D1](https://developers.cloudflare.com/d1/) for storing data and [Cloudflare R2](https://developers.cloudflare.com/r2/) for storing files.

## Getting Started

First, clone this repository and run `yarn --dev` to install the dependendies for all the sub-projects.

### Local Infrastructure

To start local versions of AWS S3 and AWS DynamoDB, you can run `docker-compose -f docker-compose.dev.yml up` and leave the below values the same.

### Worker

Next, enter the `worker` folder and create a new `.env` file containing the following:

```
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
S3_DEFAULT_REGION=eu-west-1
S3_ENDPOINT_URL=localhost:9000
S3_BUCKET=vh7-uploads
DYNAMODB_ACCESS_KEY_ID=DUMMYIDEXAMPLE
DYNAMODB_SECRET_ACCESS_KEY=DUMMYEXAMPLEKEY
DYNAMODB_DEFAULT_REGION=eu-west-1
DYNAMODB_TABLE=vh7
DYNAMODB_ENDPOINT_URL=http://localhost:8100
VH7_ENV=development
```

Then run `yarn run dev` to start a local development server.

### Frontend

To start the frontend, enter the `app` folder and run `yarn run dev`.

Visit `http://localhost:3000` in your web browser.
