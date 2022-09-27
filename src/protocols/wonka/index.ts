import { PublicKey } from '@solana/web3.js';
import { Windex } from '@wonka-labs/wonka-js';
import { SolDomainMetadata } from '@wonka-labs/wonka-js/lib/windex';
import { GraphQLClient, gql } from 'graphql-request'
import { NftEdge } from './types';

export default class WonkaAPI {
  private client: GraphQLClient;
  private GQL_STR_NFT: string = `
  node {
    id
    name
    symbol
    image {
      orig
    }
    owner {
      address
      sol_domain
      twitter_handle
    }
    metaplex_metadata {
      mint
      name
      symbol
      primary_sale_happened
      seller_fee_basis_points
      is_mutable
      token_standard
      uses {
        use_method
        remaining
        total
      }
      collection {
        verified
        key
      }
      creators {
        address
        verified
        share
      }
    }
    external_metadata {
      collection {
        name
        family
      }
      attributes {
        trait_type
        value
        display_type
      }
    }
  }
  `

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
              ${this.GQL_STR_NFT}
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
              ${this.GQL_STR_NFT}
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
      console.error('failed to fetchSolDomainMetadata wallet:[$s]', walletAddress, err);
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
          ${this.GQL_STR_NFT}
          cursor
        }
      }
    }`;

    return this.client
      .request(query)
      .then((data) => data['nftsByWallet']['edges']);
  }
}
