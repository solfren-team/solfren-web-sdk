import { GraphQLClient, gql } from 'graphql-request'
import { FollowingCount, Identity } from './types';

export default class CyberConnect {
  private client: GraphQLClient;

  public constructor(endpoint: string) {
    this.client = new GraphQLClient(endpoint);
  }

  public async getIdentity(walletAddress: string): Promise<Identity | null> {
    const query = gql`
      query($address: String!) {
        identity(address: $address) {
          followerCount
          followingCount
          twitter {
            handle
            avatar
            verified
            tweetId
            source
            followerCount
          }
          github {
            username
            gistId
            userId
          }
        }
      }
    `;
    const variables = {
      address: walletAddress,
    };

    return this.client
      .request<{ identity: Identity }>(query, variables)
      .then((res) => res.identity)
      .catch((err) => {
        console.error('failed to identity', err);
        return null;
      });
  }
}
