import SolFrenAPI from "../../protocols/solfren-nft";
import marketplaces from "../../protocols/marketplaces";
import { API as MarketplaceAPI, CollectionStats } from "../../protocols/marketplaces/types";
import { CollectionResource, ItemResource, ItemOwnerResource } from "./types";
import { Options } from '../../options';
import { Windex } from "@wonka-labs/wonka-js";
import { CollectionItem } from "@wonka-labs/wonka-js/lib/windex";
import { Connection, PublicKey, ParsedAccountData } from '@solana/web3.js';

export default class Collection {
  private solFrenAPI: SolFrenAPI;
  private marketplaces: Record<string, MarketplaceAPI> = marketplaces;
  private connection: Connection;

  public constructor(options: Options) {
    if (options.solFrenAPI == undefined) {
      throw new Error('Collection: must provide SolFrenAPI.apiKey');
    }
    this.solFrenAPI = new SolFrenAPI(options.solFrenAPI.apiKey);
    this.connection = new Connection(options.solanaRPC.endpoint);
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

  public async listItems(id: string, size: number = 100): Promise<ItemResource[] | null> {
    let nfts: CollectionItem[] | undefined;
    try {
      nfts = await Windex.fetchNFTsByCollectionID(new PublicKey(id), size, Windex.MAINNET_ENDPOINT);
    } catch (err) {
      return null;
    }

    const items = nfts.map(async (nft: CollectionItem): Promise<ItemResource> => {
      return {
        id: nft.address,
        name: nft.name,
        image: nft.image_url,
        owner: await this.getOwnerOfNFT(nft.address),
      };
    });

    // TODO: handle `collected`

    return Promise.all(items);
  }

  // getOwnerOfNFT returns owner of nft,
  // refer to https://solanacookbook.com/references/nfts.html#how-to-get-the-owner-of-an-nft.
  private async getOwnerOfNFT(mintAddress: string): Promise<ItemOwnerResource | null> {
    try {
      const tokenLargestAccounts = await this.connection.getTokenLargestAccounts(new PublicKey(mintAddress));
      const parsedAccountInfo = await this.connection.getParsedAccountInfo(tokenLargestAccounts.value[0].address);
      return {
        id: (parsedAccountInfo.value?.data as ParsedAccountData).parsed.info.owner,
      };
    } catch (err) {
      // TODO: handle err
      return null;
    }
  }
}
