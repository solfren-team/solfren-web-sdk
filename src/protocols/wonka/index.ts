import { PublicKey } from '@solana/web3.js';
import { Windex } from '@wonka-labs/wonka-js';
import { SolDomainMetadata } from '@wonka-labs/wonka-js/lib/windex';
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

  public async fetchSolDomainMetadata(walletAddress: string): Promise<SolDomainMetadata | undefined> {
    try {
      return await Windex.fetchSolDomainMetadataByAddress(new PublicKey(walletAddress));
    } catch (err) {
      console.error('failed to fetchSolDomainMetadata', err);
      return undefined;
    }
  }

  public async nftsByWallet(walletAddress: string, limit: number = 30, cursor?: string): Promise<NftEdge[]> {
    let cursorQuery = `first: ${limit}`;
    if (cursor) {
      cursorQuery += `, after: "${cursor}"`;
    }
    const query = gql`
    {
      nftsByWallet(wallet: "${walletAddress}", ${cursorQuery}) {
        edges {
          node {
            id
            name
            symbol
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
    }`;

    return this.client
      .request(query)
      .then((data) => data['nftsByWallet']['edges']);
  }
}
