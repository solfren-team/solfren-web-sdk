import got from 'got';
import { listNftsResponse } from './response';

export default class SimpleHash {
  private endpoint: string = 'https://api.simplehash.com/api/v0';
  private key: string;

  public constructor(key: string) {
    this.key = key;
  }

  public async nftsByWallet(walletAddress: string, cursor?: string): Promise<listNftsResponse> {
    const url = cursor ?? `${this.endpoint}/nfts/owners?chains=solana&wallet_addresses=${walletAddress}`;

    return await got({
      method: 'get',
      url,
      headers: {
        'accept': 'application/json',
        'x-api-key': this.key,
      }
    }).json<listNftsResponse>();
  }

  public async nftsByCollection(id: string, cursor?: string): Promise<listNftsResponse> {
    const collectionId = await this.lookup(id);
    const url = cursor ?? `${this.endpoint}/nfts/collection/${collectionId}`;

    return await got({
      method: 'get',
      url,
      headers: {
        'accept': 'application/json',
        'x-api-key': this.key,
      }
    }).json<listNftsResponse>();
  }

  /**
   * Lookup collection id of SimpleHash.
   * @param id
   * @returns string
   */
  private async lookup(id: string): Promise<string> {
    const resp = await got({
      method: 'get',
      url: `${this.endpoint}/nfts/collections?metaplex_mint=${id}`,
      headers: {
        'accept': 'application/json',
        'x-api-key': this.key,
      }
    }).json<{
      collections: {
        id: string;
        name?: string;
        description?: string;
        chain: string;
      }[]
    }>();

    return resp.collections[0].id;
  }
}
