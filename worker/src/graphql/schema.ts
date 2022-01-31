import {
  GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLNonNull, GraphQLError,
} from 'graphql';
import { z } from 'zod';
import { customAlphabet } from 'nanoid/async';
import { korma, KVType } from '../storage';
import { rootResolver } from './korma_resolver';
import GraphQLShortLinkType from './types/shortlink';

const ShortLinkArgs = z.object({
  url: z.string().url(),
});

type ShortLinkArgsT = z.infer<typeof ShortLinkArgs>;

async function generateId() {
  return customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 4)();
}

export default new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      shortLink: {
        type: GraphQLShortLinkType,
        args: {
          id: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: rootResolver(KVType.ShortLink, 'url'),
      },
    },
  }),
  mutation: new GraphQLObjectType({
    name: 'RootMutationType',
    fields: {
      newShortLink: {
        type: new GraphQLNonNull(GraphQLShortLinkType),
        args: {
          url: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: async (_: any, args: ShortLinkArgsT) => {
          const data = ShortLinkArgs.safeParse(args);

          if (!data.success) {
            throw new GraphQLError(data.error.message);
          }

          const id = await korma.save(KVType.ShortLink, {
            _id: await generateId(),
            ...data.data,
          });

          return {
            _id: id,
            ...data.data,
          };
        },
      },
    },
  }),
});
