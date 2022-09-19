require('dotenv').config();

module.exports = {
  cloudflare: {
    accountId: process.env.CF_ACCOUNT_ID,
    authToken: process.env.CF_AUTH_TOKEN,
    namespaceId: process.env.CF_NAMESPACE_ID
  },
  s3: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    endpointUrl: process.env.S3_ENDPOINT_URL,
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
