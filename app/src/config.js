import { gql } from "graphql-request";

const config = {
  apiUrl: 'https://vh7.uk/graphql',
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
