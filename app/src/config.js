import { gql } from "graphql-request";

const config = {
  apiUrl: process.env.NODE_ENV === 'production' ? 'https://vh7.uk/graphql' : 'http://localhost:8787/graphql',
  baseUrl: process.env.NODE_ENV === 'production' ? 'http://vh7.uk/' : 'http://localhost:8787/',
  mutations: {
    newLink: gql`
      mutation ($url: String!) {
        link: newShortLink(url: $url) {
          _id
        }
      }
    `
  }
};

export default config;
