import { GraphQLClient, gql } from 'graphql-request'
import { Identity } from './types';

export default class CyberConnect {
  private client: GraphQLClient;

  public constructor(endpoint: string) {
    this.client = new GraphQLClient(endpoint);
  }

  public async getIdentity(walletAddress: string, limit: number = 30, cursor: string = "-1"): Promise<Identity | null> {
    const query = gql`
      query(
        $address: String!
        $first: Int
        $after: String
      ) {
        identity(address: $address) {
          followerCount
          followingCount
          followers(
            first: $first
            after: $after
          ) {
            pageInfo {
              hasNextPage
            }
            list {
              address
            }
          }
          followings(
            first: $first
            after: $after
          ) {
            pageInfo {
              hasNextPage
            }
            list {
              address
            }
          }
        }
      }
    `;
    const variables = {
      address: walletAddress,
      first: limit,
      after: cursor,
    };

    return this.client
      .request<{ identity: Identity }>(query, variables)
      .then((res) => res.identity)
      .catch((err) => {
        console.error('failed to getIdentity', err);
        return null;
      });
  }
}
