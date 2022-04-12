const WorkersKVREST = require('@sagi.io/workers-kv');
const fs = require('fs');
const config = require('./config');
const { S3 } = require("aws-sdk");
const signale = require("signale");

signale.info(`Performing VH7 cleanup
 - KV Namespace: ${config.cloudflare.namespaceId.substring(0, 6)}...
 - S3 Bucket: ${config.s3.bucket}`);

const s3 = new S3({
  endpoint: config.s3.endpointUrl,
  credentials: {
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey,
  }
});

function processItem(data) {
  // don't delete anything if newer than 2 months
  const days = Math.floor((new Date() - new Date(data.created)) / 86400000);
  if (days < 60) {
    return false;
  }

  switch (data.type) {
    case "url:1":
      const hostname = (new URL(data.url)).hostname;
      // only clean up if contained in this list
      if (config.cleanupHostnames.includes(hostname)) {
        return true;
      }
      break;
    case "upload:1":
      // always clean up uploads
      return true;
  }

  return false;
}

(async () => {
  const WorkersKV = new WorkersKVREST({
    cfAccountId: config.cloudflare.accountId,
    cfAuthToken: config.cloudflare.authToken
  });
  const allKeys = await WorkersKV.listAllKeys({
    namespaceId: config.cloudflare.namespaceId
  });
  const backup = {};

  if (!allKeys.success) {
    signale.error("Could not retrieve keys", allKeys);
    return;
  }

  const status = new signale.Signale({
    interactive: true,
    scope: 'status'
  });

  for (const { name: key } of allKeys.result) {
    status.info(`Processing key ${key}...`);

    const data = JSON.parse(await WorkersKV.readKey({
      key,
      namespaceId: config.cloudflare.namespaceId
    }));
    backup[key] = data;
    const del = processItem(data);

    if (del) {
      signale.info(`Deleting key ${key}...\n${JSON.stringify(data)}`);
      await WorkersKV.deleteKey({
        key,
        namespaceId: config.cloudflare.namespaceId
      });
      if (data.type === 'upload:1') {
        await s3.deleteObject({
          Bucket: config.s3.bucket,
          Key: key
        }).promise();
      }
    }
  }

  const d = new Date();
  fs.writeFileSync(`./backup-${d.getDate()}-${d.getMonth()+1}-${d.getFullYear()}`, JSON.stringify(backup));
})();
