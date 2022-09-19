export {};

declare global {
  const VH7: KVNamespace;
  const AWS_ACCESS_KEY_ID: string;
  const AWS_SECRET_ACCESS_KEY: string;
  const AWS_DEFAULT_REGION: string;
  const AWS_S3_BUCKET: string;
  const AWS_ENDPOINT_URL: string;
  const DYNAMODB_ACCESS_KEY_ID: string;
  const DYNAMODB_SECRET_ACCESS_KEY: string;
  const DYNAMODB_DEFAULT_REGION: string;
  const DYNAMODB_TABLE: string;
  const DYNAMODB_ENDPOINT_URL: string;
  const SENTRY_DSN: string;
  const SENTRY_CLIENT_ID: string;
  const SENTRY_CLIENT_SECRET: string;
  const VH7_ENV: string;
}
