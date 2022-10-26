import { GraphQLClient, gql } from 'graphql-request'
import { Followers, Followings, Identity } from './types';

export default class CyberConnect {
  private client: GraphQLClient;

  public constructor(endpoint: string) {
    this.client = new GraphQLClient(endpoint);
  }

  public async getIdentity(walletAddress: string): Promise<Identity | null> {
    const query = gql`
      query FullIdentityQuery($address: String!) {
        identity(address: $address, network: SOLANA) {
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
        console.error('failed to getIdentity addr:[%s]', walletAddress, err);
        return null;
      });
  }

  public async listFollowers(walletAddress: string, limit: number = 30, cursor: string = ''): Promise<Followers> {
    const query = gql`
      query FullIdentityQuery($address: String!) {
        identity(address: $address, network: SOLANA) {
          followers(first: ${limit}, after: "${cursor}") {
            pageInfo {
              startCursor
              endCursor
              hasNextPage
              hasPreviousPage
            }
            list {
              address
              domain
              avatar
              namespace
              lastModifiedTime
            }
          }
        }
      }
    `;
    const variables = {
      address: walletAddress,
    };

    return this.client
      .request<{ identity: Identity }>(query, variables)
      .then((res) => res.identity.followers);
  }

  public async listFollowings(walletAddress: string, limit: number = 30, cursor: string = ''): Promise<Followings> {
    const query = gql`
      query FullIdentityQuery($address: String!) {
        identity(address: $address, network: SOLANA) {
          followings(first: ${limit}, after: "${cursor}") {
            pageInfo {
              startCursor
              endCursor
              hasNextPage
              hasPreviousPage
            }
            list {
              address
              domain
              avatar
              namespace
              lastModifiedTime
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
      .then((res) => res.identity.followings);
  }
}
