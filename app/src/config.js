import { gql } from "graphql-request";

const config = {
  apiUrl: 'http://127.0.0.1:8787/graphql',
  baseUrl: 'http://vh7.uk/',
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
