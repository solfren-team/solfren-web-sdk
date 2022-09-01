import { GraphQLClient, gql } from 'graphql-request'
import { FollowingCount } from './types';

export default class CyberConnect {
  private client: GraphQLClient;

  public constructor(endpoint: string) {
    this.client = new GraphQLClient(endpoint);
  }

  public async getFollowingCount(walletAddress: string): Promise<FollowingCount | null> {
    const query = gql`
      query($address: String!) {
        identity(address: $address) {
          followerCount
          followingCount
        }
      }
    `;
    const variables = {
      address: walletAddress,
    };

    return this.client
      .request<{ identity: FollowingCount }>(query, variables)
      .then((res) => res.identity)
      .catch((err) => {
        console.error('failed to getFollowingCount', err);
        return null;
      });
  }
}
