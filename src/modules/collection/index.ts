import assert from 'assert';
import SolFrenAPI from "../../protocols/solfren-nft";
import marketplaces from "../../protocols/marketplaces";
import { API as MarketplaceAPI, CollectionStats } from "../../protocols/marketplaces/types";
import { CollectionResource, ItemResource, ItemOwnerResource } from "./types";
import { Config } from '../../types';
import { Connection, PublicKey, ParsedAccountData } from '@solana/web3.js';
import WonkaAPI from '../../protocols/wonka';
import { NftEdge } from '../../protocols/wonka/types';
import { getCyberConnectSDK } from '../../utils/cyberConnectSDK';
import { ConnectionType } from '@cyberlab/cyberconnect';

export default class Collection {
  private solFrenAPI: SolFrenAPI;
  private marketplaces: Record<string, MarketplaceAPI> = marketplaces;
  private solanaConn: Connection;
  private wonkaAPI: WonkaAPI;

  public constructor(config: Config) {
    assert(config?.solFrenAPI?.apiKey);
    assert(config?.solanaRPC?.endpoint);
    assert(config?.wonkaAPI?.endpoint);

    this.solFrenAPI = new SolFrenAPI(config.solFrenAPI.apiKey);
    this.solanaConn = new Connection(config.solanaRPC.endpoint);
    this.wonkaAPI = new WonkaAPI(config.wonkaAPI.endpoint);
  }

  public async get(id: string): Promise<CollectionResource | null> {
    const collection = await this.solFrenAPI.getCollection(id);
    if (collection) {
      let stats: CollectionStats | null = null;
      if (collection.marketplace && this.marketplaces[collection.marketplace.name]) {
        stats = await this.marketplaces[collection.marketplace.name].getStats(collection.marketplace.id);
      }

      return {
        id,
        name: collection.name ?? '',
        symbol: collection.symbol ?? '',
        description: collection.description ?? '',
        image: collection.image ?? '',
        website: collection.website ?? '',
        discord: collection.discord ?? '',
        twitter: collection.twitter ?? '',
        categories: collection.categories,
        createdAt: new Date(collection.createdAt ?? ''),
        ...(stats && { stats }),
      }
    }
    return null;
  }

  /**
   * listNfts returns nfts and nextCursor.
   * @param id
   * @param size
   * @param cursor
   * @returns [nfts, nextCursor]
   */
  public async listNfts(id: string, size: number = 30, cursor?: string): Promise<[ItemResource[], string]> {
    let nfts: NftEdge[] | null;
    try {
      nfts = await this.wonkaAPI.nftsByCollection(id, size, cursor);
    } catch (err) {
      return [[], ""];
    }

    const items: ItemResource[] = [];
    let nextCursor: string = '';
    for (const nft of nfts) {
      items.push({
        id: nft.node.id,
        name: nft.node.name,
        image: nft.node.image.orig,
        owner: await this.getOwnerOfNFT(nft.node.owner.address),
      });
      nextCursor = nft.cursor;
    }

    // TODO: handle `collected`

    return [items, nextCursor];
  }

  // getOwnerOfNFT returns owner of nft,
  // refer to https://solanacookbook.com/references/nfts.html#how-to-get-the-owner-of-an-nft.
  private async getOwnerOfNFT(mintAddress: string): Promise<ItemOwnerResource | null> {
    try {
      const tokenLargestAccounts = await this.solanaConn.getTokenLargestAccounts(new PublicKey(mintAddress));
      const parsedAccountInfo = await this.solanaConn.getParsedAccountInfo(tokenLargestAccounts.value[0].address);
      return {
        id: (parsedAccountInfo.value?.data as ParsedAccountData).parsed.info.owner,
      };
    } catch (err) {
      // TODO: handle err
      return null;
    }
  }

  public async like(provider: any, collectionAddress: string) {
    await getCyberConnectSDK(provider).connect(collectionAddress, undefined, ConnectionType.LIKE);
  }

  public async unlike(provider: any, collectionAddress: string) {
    await getCyberConnectSDK(provider).disconnect(collectionAddress);
  }
}
