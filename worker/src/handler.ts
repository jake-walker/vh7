import { graphql } from 'graphql';
import { z } from 'zod';
import schema from './graphql/schema';
import { korma, KVType } from './storage';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const requestDataSchema = z.object({
  query: z.string(),
  variables: z.optional(z.record(z.any())),
  operationName: z.optional(z.string()),
});

async function graphQLHandler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({
      error: 'Method not supported',
    }), {
      headers,
      status: 400,
    });
  }

  const requestData = requestDataSchema.safeParse(await request.json());

  if (!requestData.success) {
    return new Response(JSON.stringify({
      error: 'Invalid request data',
    }), {
      headers,
      status: 400,
    });
  }

  const responseData = await graphql({
    schema,
    source: requestData.data.query,
    variableValues: requestData.data.variables,
    operationName: requestData.data.operationName,
  });

  return new Response(JSON.stringify(responseData), {
    headers,
  });
}

async function linkHandler(request: Request, url: URL): Promise<Response> {
  const id = url.pathname.slice(1);

  const shortlink = await korma.findOne(KVType.ShortLink, id);

  if (shortlink !== null) {
    return Response.redirect(shortlink.url, 301);
  }

  return new Response('Short link not found', {
    ...headers,
    status: 404,
  });
}

export default async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);

  // Respond to CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        ...headers,
        Allow: 'OPTIONS, POST',
      },
      status: 204,
    });
  }

  switch (url.pathname) {
    case '/':
      return new Response('Use the /graphql route for the API', {
        headers,
      });
    case '/graphql':
      return graphQLHandler(request);
    default:
      return linkHandler(request, url);
  }
}
