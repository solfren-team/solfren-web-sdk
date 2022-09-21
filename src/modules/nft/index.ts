import assert from 'assert';
import SolFrenAPI from "../../protocols/solfren-nft";
import marketplaces from "../../protocols/marketplaces";
import { API as MarketplaceAPI, CollectionStats } from "../../protocols/marketplaces/types";
import { CollectionResource, ItemResource, ItemOwnerResource, ListActivitiesResponse, CommentResource } from "./types";
import { Config } from '../../types';
import { Connection, PublicKey, ParsedAccountData } from '@solana/web3.js';
import WonkaAPI from '../../protocols/wonka';
import { NftEdge } from '../../protocols/wonka/types';
import { getCyberConnectSDK } from '../../utils/cyberConnectSDK';
import { ConnectionType } from '@cyberlab/cyberconnect';
import { SolNFTTransSale } from "../../protocols/solfren-nft/types";

export default class NFT {
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

  public async getCollection(id: string): Promise<CollectionResource | null> {
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
   * listByCollection returns NFTs and nextCursor.
   * @param id
   * @param size
   * @param cursor
   * @returns [nfts, nextCursor]
   */
  public async listByCollection(id: string, size: number = 30, cursor?: string): Promise<[ItemResource[], string]> {
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
        owner: await this.getOwner(nft.node.owner.address),
      });
      nextCursor = nft.cursor;
    }

    // TODO: handle `collected`

    return [items, nextCursor];
  }

  public async listActivities(id: string, size: number = 30, cursor?: string): Promise<ListActivitiesResponse> {
    const [trans, nextCursor] = await this.solFrenAPI.listTradesByCollection(id, size, cursor);

    // TODO: handle `followed`

    return {
      activities: trans.map((transaction: SolNFTTransSale) => ({
        id: transaction.signature,
        price: transaction.price,
        item: {
          id: transaction.nftInfo.mintAddress,
          name: transaction.nftInfo.name,
          image: transaction.nftInfo.uriMetadata.image ?? "",
          categories: transaction.nftInfo.collectionInfo?.categories,
          owner: null,
        },
        buyer: { id: transaction.targetAddress ?? "" },
        seller: { id: transaction.ownerAddress },
        timestamp: transaction.timestamp,
      })),
      cursor: nextCursor,
    }
  }

  public async createCollectionComment(id: string, author: string, content: string): Promise<CommentResource> {
    const resp = await this.solFrenAPI.createCollectionComment(id, author, content);
    const owner = await this.getOwner(resp.author);

    return {
      content: resp.content,
      createdAt: resp.createdAt,
      owner: {
        id: author,
        avatar: owner?.avatar
      },
    }
  }

  // getOwner returns owner of nft,
  // refer to https://solanacookbook.com/references/nfts.html#how-to-get-the-owner-of-an-nft.
  private async getOwner(mintAddress: string): Promise<ItemOwnerResource | null> {
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

  public async likeCollection(provider: any, collectionId: string) {
    await getCyberConnectSDK(provider).connect(collectionId, undefined, ConnectionType.LIKE);
  }

  public async unlikeCollection(provider: any, collectionId: string) {
    await getCyberConnectSDK(provider).disconnect(collectionId);
  }

  public async likeNFT(provider: any, mintAddress: string) {
    await getCyberConnectSDK(provider).connect(mintAddress, undefined, ConnectionType.LIKE);
  }

  public async unlikeNFT(provider: any, mintAddress: string) {
    await getCyberConnectSDK(provider).disconnect(mintAddress);
  }
}
