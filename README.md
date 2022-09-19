# VH7
A free and open source URL shortening, file sharing and pastebin service.

## Overview

VH7 is a small project offering a free URL shortening, file sharing and pastebin service. Unlike other major URL shorteners, VH7 offers shorter links (4 characters) as well as the ability to have a short link for files and code snippets under the same roof.

VH7 utilises [Cloudflare Workers](https://workers.cloudflare.com/) for hosting the API, [Cloudflare Pages](https://pages.cloudflare.com/) for hosting the frontend, [AWS DynamoDB](https://aws.amazon.com/dynamodb/) for storing data and [AWS S3](https://aws.amazon.com/s3/) for storing files. _I have chosen to use two different cloud providers to allow me to run VH7 as cheaply as I can. Cloudflare gives a very generous Workers free tier, whereas AWS DynamoDB gives a good balance between price and flexability (whereas Cloudflare Workers KV which was used in the past was slightly more difficult to work with)._

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
