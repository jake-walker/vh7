import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient, ScanCommand, DeleteCommand
} from '@aws-sdk/lib-dynamodb';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import signale from 'signale';
import config from './config.js';

const dbClient = new DynamoDBClient({
  region: config.dynamodb.region,
  credentials: {
    accessKeyId: config.dynamodb.accessKeyId,
    secretAccessKey: config.dynamodb.secretAccessKey
  },
  endpoint: config.dynamodb.endpointUrl
});

const docClient = DynamoDBDocumentClient.from(dbClient, {
  marshallOptions: {
    convertEmptyValues: false,
    removeUndefinedValues: false,
    convertClassInstanceToMap: false,
  },
  unmarshallOptions: {
    wrapNumbers: false,
  }
});

const s3Client = new S3Client({
  region: config.s3.region,
  credentials: {
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey
  },
  endpoint: config.s3.endpointUrl
});

function shouldDelete(item) {
  const now = new Date();
  const expiry = new Date(item.expires);
  const days = Math.floor((new Date() - new Date(item.created)) / 86400000);

  // has the item expired?
  if (item.expires !== null && expiry < now) {
    console.debug("Reason: item has expired");
    return true;
  }

  // is the item an upload that is at least 30 days old?
  if (item.type.startsWith("upload:") && days > 30) {
    console.debug("Reason: upload is older than 30 days");
    return true;
  }

  // is the item at least 60 days old and a domain to clean up?
  if (item.type === "url:1" && days > 60) {
    const hostname = (new URL(item.data.url)).hostname;
    if (config.cleanupHostnames.includes(hostname)) {
      console.debug("Reason: cleanup domain older than 60 days");
      return true;
    }
  }

  return false;
}

(async () => {
  const documents = await docClient.send(new ScanCommand({
    TableName: config.dynamodb.table
  }));

  const status = new signale.Signale({
    interactive: true,
    scope: 'status'
  });

  for (const item of documents.Items) {
    status.info(`Processing item ${item.id}...`);

    if (!shouldDelete(item)) {
      continue;
    }

    status.pending(`Deleting item ${item.id}...`);

    if (item.type.startsWith('upload:')) {
      await s3Client.send(new DeleteObjectCommand({
        Bucket: config.s3.bucket,
        Key: item.id
      }));
    }

    await docClient.send(new DeleteCommand({
      TableName: config.dynamodb.table,
      Key: {
        id: item.id
      }
    }));
  }
})();
