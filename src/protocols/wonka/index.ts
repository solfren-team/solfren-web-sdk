import { GraphQLClient, gql } from 'graphql-request'
import { NftEdge } from './types';

export default class WonkaAPI {
  private client: GraphQLClient;

  public constructor(endpoint: string) {
    this.client = new GraphQLClient(endpoint);
  }

  public async nftsByCollection(id: string, limit: number = 30, cursor?: string): Promise<NftEdge[]> {
    let query: string;
    if (cursor) {
      query = gql`
        {
          nftsByCollection(
            collectionId: "${id}"
            first: ${limit},
            after: "${cursor}"
          ) {
            edges {
              node {
                id
                name
                symbol
                owner {
                  address
                  sol_domain
                }
                image {
                  orig
                }
                metaplex_metadata {
                  mint
                  creators {
                    address
                    verified
                    share
                  }
                }
              }
              cursor
            }
          }
        }`
    } else {
      query = gql`
        {
          nftsByCollection(
            collectionId: "${id}"
            first: ${limit}
          ) {
            edges {
              node {
                id
                name
                symbol
                owner {
                  address
                  sol_domain
                }
                image {
                  orig
                }
                metaplex_metadata {
                  mint
                  creators {
                    address
                    verified
                    share
                  }
                }
              }
              cursor
            }
          }
        }`
    }

    return this.client
      .request(query)
      .then((data) => data['nftsByCollection']['edges']);
  }
}
