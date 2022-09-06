import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient, PutCommand, GetCommand, DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { PasteItem, ShortLinkItem, UploadItem } from './schema';

const client = new DynamoDBClient({
  region: DYNAMODB_DEFAULT_REGION,
  credentials: {
    accessKeyId: DYNAMODB_ACCESS_KEY_ID,
    secretAccessKey: DYNAMODB_SECRET_ACCESS_KEY,
  },
  endpoint: DYNAMODB_ENDPOINT_URL || undefined,
});

const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    convertEmptyValues: false,
    removeUndefinedValues: false,
    convertClassInstanceToMap: false,
  },
  unmarshallOptions: {
    wrapNumbers: false,
  },
});

export async function save(item: ShortLinkItem | PasteItem | UploadItem) {
  await docClient.send(new PutCommand({
    TableName: DYNAMODB_TABLE,
    Item: item,
  }));
}

export async function get(id: string) {
  const res = await docClient.send(new GetCommand({
    TableName: DYNAMODB_TABLE,
    Key: {
      id,
    },
  }));

  if (res.Item === undefined) {
    return null;
  }

  return res.Item;
}

export async function remove(id: string) {
  await docClient.send(new DeleteCommand({
    TableName: DYNAMODB_TABLE,
    Key: {
      id,
    },
  }));
}
