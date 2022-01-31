import { korma } from '../storage';

interface GraphQLParams {
  id: string
}

export function basicResolver(type: string, attribute: string) {
  return async (obj: any) => {
    if (attribute in obj) return obj[attribute];
    return korma.getAttribute(type, obj._id, attribute);
  };
}

export function rootResolver(type: string, defaultAttribute: string) {
  return async (_: any, { id }: GraphQLParams) => {
    const attr = await korma.getAttribute(type, id, defaultAttribute);

    if (attr === null) {
      return null;
    }

    return {
      _id: id,
      [defaultAttribute]: attr,
    };
  };
}

export function nestedResolver(parentType: string, parentAttribute: string) {
  return async ({ id }: GraphQLParams) => {
    const childId = await korma.getAttribute(parentType, id, parentAttribute);

    return {
      _id: childId,
    };
  };
}
