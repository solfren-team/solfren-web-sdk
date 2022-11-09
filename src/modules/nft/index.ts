import assert from 'assert';
import SolFrenAPI from "../../protocols/solfren-nft";
import marketplaces from "../../protocols/marketplaces";
import { API as MarketplaceAPI, CollectionStats } from "../../protocols/marketplaces/types";
import { CollectionItem, NFTItem, ListActivitiesResponse, ListCollectionsResponse, CommentItem } from "./types";
import { Config } from '../../types';
import { getCyberConnectSDK } from '../../utils/cyberConnectSDK';
import { ConnectionType } from '@cyberlab/cyberconnect';
import { SolNFTTransSale, CollectionInfo } from "../../protocols/solfren-nft/types";
import SimpleHash from '../../protocols/simpleHash';
import { Nft } from '../../protocols/simpleHash/types';


export default class NFT {
  private solFrenAPI: SolFrenAPI;
  private marketplaces: Record<string, MarketplaceAPI> = marketplaces;
  private simpleHash: SimpleHash;

  public constructor(config: Config) {
    assert(config?.solFrenAPI?.apiKey);
    assert(config.simpleHash?.key);

    this.solFrenAPI = new SolFrenAPI(config.solFrenAPI.apiKey);
    this.simpleHash = new SimpleHash(config.simpleHash?.key);
  }

  public async getCollection(id: string): Promise<CollectionItem | null> {
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
   * @param cursor
   * @returns [nfts, nextCursor]
   */
  public async listByCollection(id: string, cursor?: string): Promise<[NFTItem[], string]> {
    const resp = await this.simpleHash.nftsByCollection(id, cursor);

    // TODO: handle `collected`

    return [this.formatNftItems(resp.nfts), resp.next ?? ''];
  }

  public async listActivitiesByCollection(id: string, size: number = 30): Promise<ListActivitiesResponse> {
    const trans = await this.solFrenAPI.listTradesByCollection(id, size);

    // TODO: handle `followed`

    return {
      activities: trans.map((transaction: SolNFTTransSale) => ({
        id: transaction.signature,
        price: transaction.price,
        item: {
          mintAddress: transaction.nftInfo.mintAddress,
          name: transaction.nftInfo.name,
          image: transaction.nftInfo.uriMetadata.image ?? "",
          categories: transaction.nftInfo.collectionInfo?.categories,
          description: transaction.nftInfo.uriMetadata.description || "",
          owner: null,
          metaplexMetadata: {
            name: transaction.nftInfo.name,
            symbol: transaction.nftInfo.symbol,
            primarySaleHappened: transaction.nftInfo.primarySaleHappened,
            sellerFeeBasisPoints: transaction.nftInfo.sellerFeeBasisPoints,
            isMutable: transaction.nftInfo.isMutable,
            tokenStandard: transaction.nftInfo.tokenStandard?.toString(),
            // `uses` no use case so far, bypass type conversion,
            // uses: transaction.nftInfo.uses,
            // `collection` should be replaced by collectionInfo.
            // collection: transaction.nftInfo.collection,
            creators: transaction.nftInfo.creators!.map((creator) => {
              return {
                address: creator.address.toString(),
                verified: creator.verified,
                share: creator.share
              }
            })
          },
          externalMetadata: {
            description: transaction.nftInfo.uriMetadata.description,
            externalUrl: transaction.nftInfo.uriMetadata.external_url,
            // animationUrl: transaction.nftInfo.uriMetadata., => not support yet.
            collection: transaction.nftInfo.uriMetadata.collection,
            attributes: transaction.nftInfo.uriMetadata.attributes?.map((attribute) => {
              return {
                traitType: attribute.trait_type,
                value: attribute.value
              }
            })
          }
        },
        buyer: { address: transaction.targetAddress ?? "" },
        seller: { address: transaction.ownerAddress },
        timestamp: transaction.timestamp,
      })),
    }
  }

  /**
   * listByWallet returns NFTs and nextCursor.
   * @param walletAddress
   * @param cursor
   * @returns [nfts, nextCursor]
   */
  public async listByWallet(walletAddress: string, cursor?: string): Promise<[NFTItem[], string]> {
    const resp = await this.simpleHash.nftsByWallet(walletAddress, cursor);
    return [this.formatNftItems(resp.nfts), resp.next ?? ''];
  }

  public async listCollections(size: number = 30, cursor?: CollectionItem): Promise<ListCollectionsResponse> {
    const resp = await this.solFrenAPI.listCollections(size, (cursor && { '@timestamp': cursor?.createdAt, collectionId: cursor.id }));

    const collections: CollectionItem[] = [];
    for (let i = 0; i < resp.collections.length; i++) {
      const item: CollectionInfo = resp.collections[i];

      let stats: CollectionStats | null = null;
      if (item.marketplace && this.marketplaces[item.marketplace.name]) {
        stats = await this.marketplaces[item.marketplace.name].getStats(item.marketplace.id);
      }

      collections.push({
        id: item.collectionId,
        name: item.name,
        symbol: item.symbol,
        description: item.description ?? '',
        image: item.image ?? '',
        website: item.website,
        twitter: item.twitter,
        discord: item.discord,
        categories: item.categories,
        createdAt: item['@timestamp'],
        ...(stats && { stats }),
      });
    }

    return {
      collections,
      hasNextPage: collections.length == size,
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

  public async createCollectionComment(id: string, author: string, content: string): Promise<CommentItem> {
    const resp = await this.solFrenAPI.createCollectionComment(id, author, content);

    return {
      id: resp.id,
      content: resp.content,
      createdAt: resp.createdAt,
      owner: {
        address: author,
      },
    }
  }

  public async listCollectionComments(id: string): Promise<CommentItem[]> {
    const resp = await this.solFrenAPI.listCollectionComments(id);
    console.log(JSON.stringify(resp));
    return resp.map(comment => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      owner: {
        address: comment.author,
      }
    }));
  }

  private formatNftItems(nfts: Nft[]): NFTItem[] {
    const items: NFTItem[] = [];
    for (const nft of nfts) {
      items.push({
        mintAddress: nft.contract_address,
        name: nft.name,
        image: nft.image_url,
        description: nft.description,
        owner: {
          address: nft.last_sale?.to_address ?? nft.owners[0].owner_address,
        },
        externalMetadata: {
          description: nft.description,
          externalUrl: nft.external_url,
          animationUrl: nft.extra_metadata.animation_original_url,
          collection: {
            name: nft.collection.name,
          },
          attributes: nft.extra_metadata.attributes,
        },
        metaplexMetadata: {
          name: nft.name,
          symbol: nft.contract.symbol,
          sellerFeeBasisPoints: nft.extra_metadata.seller_fee_basis_points,
          isMutable: nft.extra_metadata.is_mutable,
          creators: nft.extra_metadata.creators,
        },
      })
    }

    return items;
  }
}
