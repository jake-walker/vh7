import * as dotenv from 'dotenv';

dotenv.config({
  path: './prod.env'
});

export default {
  dynamodb: {
    accessKeyId: process.env.DYNAMODB_ACCESS_KEY_ID,
    secretAccessKey: process.env.DYNAMODB_SECRET_ACCESS_KEY,
    endpointUrl: process.env.DYNAMODB_ENDPOINT_URL || undefined,
    region: process.env.DYNAMODB_DEFAULT_REGION || undefined,
    table: process.env.DYNAMODB_TABLE
  },
  s3: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    endpointUrl: process.env.S3_ENDPOINT_URL || undefined,
    region: process.env.S3_DEFAULT_REGION || undefined,
    bucket: process.env.S3_BUCKET
  },

  cleanupHostnames: [
    "richup.io",
    "geoguessr.com",
    "haxball.com",
    "allbad.cards",
    "garticphone.com",
    "shellshock.io",
    "play.typeracer.com"
  ].reduce((hostnames, hostname) => [...hostnames, hostname, `www.${hostname}`], [])
}
