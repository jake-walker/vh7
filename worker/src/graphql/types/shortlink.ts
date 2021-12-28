import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { KVType } from '../../storage';
import { basicResolver } from '../korma_resolver';

export default new GraphQLObjectType({
  name: 'ShortLink',
  fields: {
    _id: {
      type: new GraphQLNonNull(GraphQLString),
    },
    url: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: basicResolver(KVType.ShortLink, 'url'),
    },
  },
});
