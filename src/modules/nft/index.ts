import assert from 'assert';
import SolFrenAPI from "../../protocols/solfren-nft";
import marketplaces from "../../protocols/marketplaces";
import { API as MarketplaceAPI, CollectionStats } from "../../protocols/marketplaces/types";
import { CollectionItem, NFTItem, OwnerInfo, ListActivitiesResponse, MetaplexMetadataNFTUses, ExternalMetadataAttribute, ListCollectionsResponse } from "./types";
import { Config } from '../../types';
import { Connection, PublicKey, ParsedAccountData } from '@solana/web3.js';
import WonkaAPI from '../../protocols/wonka';
import { NftEdge } from '../../protocols/wonka/types';
import { getCyberConnectSDK } from '../../utils/cyberConnectSDK';
import { ConnectionType } from '@cyberlab/cyberconnect';
import { SolNFTTransSale, CollectionInfo } from "../../protocols/solfren-nft/types";

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
   * @param size
   * @param cursor
   * @returns [nfts, nextCursor]
   */
  public async listByCollection(id: string, size: number = 30, cursor?: string): Promise<[NFTItem[], string]> {
    const nfts = await this.wonkaAPI.nftsByCollection(id, size, cursor);
    const items: NFTItem[] = [];
    let nextCursor: string = '';
    for (const nft of nfts) {
      let uses: MetaplexMetadataNFTUses | undefined;
      if (nft.node.metaplex_metadata.uses) {
        uses = {
          useMethod: nft.node.metaplex_metadata.uses.use_method,
          remaining: nft.node.metaplex_metadata.uses.remaining,
          total: nft.node.metaplex_metadata.uses.total
        }
      }
      const attributes: ExternalMetadataAttribute[] = nft.node.external_metadata?.attributes?.map((attr) => {
        return {
          traitType: attr.trait_type,
          value: attr.value,
          displayType: attr.display_type
        } as ExternalMetadataAttribute
      }) || Array()
      items.push({
        mintAddress: nft.node.metaplex_metadata.mint,
        name: nft.node.metaplex_metadata.name || nft.node.name,
        image: nft.node.image?.orig,
        description: nft.node.external_metadata?.description || "",
        owner: {
          address: nft.node.owner?.address || nft.node.token_account.owner,
          solanaDomain: nft.node.owner?.sol_domain,
          twitterHandle: nft.node.owner?.twitter_handle
        },
        metaplexMetadata: {
          name: nft.node.metaplex_metadata.name,
          symbol: nft.node.metaplex_metadata.symbol,
          primarySaleHappened: nft.node.metaplex_metadata.primary_sale_happened,
          sellerFeeBasisPoints: nft.node.metaplex_metadata.seller_fee_basis_points,
          isMutable: nft.node.metaplex_metadata.is_mutable,
          tokenStandard: nft.node.metaplex_metadata.token_standard,
          uses: uses,
          collection: nft.node.metaplex_metadata.collection,
          creators: nft.node.metaplex_metadata.creators
        },
        externalMetadata: {
          description: nft.node.external_metadata?.description,
          externalUrl: nft.node.external_metadata?.externalUrl,
          animationUrl: nft.node.external_metadata?.animationUrl,
          collection: nft.node.external_metadata?.collection,
          attributes: attributes
        }
      });
      nextCursor = nft.cursor;
    }

    // TODO: handle `collected`

    return [items, nextCursor];
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
   * @param size
   * @param cursor
   * @returns [nfts, nextCursor]
   */
  public async listByWallet(walletAddress: string, size: number = 30, cursor?: string): Promise<[NFTItem[], string]> {
    const nfts = await this.wonkaAPI.nftsByWallet(walletAddress, size, cursor);
    const items: NFTItem[] = [];
    let nextCursor: string = '';
    for (const nft of nfts) {
      let uses: MetaplexMetadataNFTUses | undefined;
      if (nft.node.metaplex_metadata.uses) {
        uses = {
          useMethod: nft.node.metaplex_metadata.uses.use_method,
          remaining: nft.node.metaplex_metadata.uses.remaining,
          total: nft.node.metaplex_metadata.uses.total
        }
      }
      const attributes: ExternalMetadataAttribute[] = nft.node.external_metadata?.attributes?.map((attr) => {
        return {
          traitType: attr.trait_type,
          value: attr.value,
          displayType: attr.display_type
        } as ExternalMetadataAttribute
      }) || Array()
      items.push({
        mintAddress: nft.node.metaplex_metadata.mint,
        name: nft.node.metaplex_metadata.name || nft.node.name,
        image: nft.node.image?.orig,
        description: nft.node.external_metadata?.description || "",
        owner: {
          address: nft.node.owner?.address || nft.node.token_account.owner,
          solanaDomain: nft.node.owner?.sol_domain,
          twitterHandle: nft.node.owner?.twitter_handle
        },
        metaplexMetadata: {
          name: nft.node.metaplex_metadata.name,
          symbol: nft.node.metaplex_metadata.symbol,
          primarySaleHappened: nft.node.metaplex_metadata.primary_sale_happened,
          sellerFeeBasisPoints: nft.node.metaplex_metadata.seller_fee_basis_points,
          isMutable: nft.node.metaplex_metadata.is_mutable,
          tokenStandard: nft.node.metaplex_metadata.token_standard,
          uses: uses,
          collection: nft.node.metaplex_metadata.collection,
          creators: nft.node.metaplex_metadata.creators
        },
        externalMetadata: {
          description: nft.node.external_metadata?.description,
          externalUrl: nft.node.external_metadata?.externalUrl,
          animationUrl: nft.node.external_metadata?.animationUrl,
          collection: nft.node.external_metadata?.collection,
          attributes: attributes
        }
      });
      nextCursor = nft.cursor;
    }

    return [items, nextCursor];
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
}
