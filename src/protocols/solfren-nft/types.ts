import { JsonMetadata, Creator } from "@metaplex-foundation/js";
import { Collection, TokenStandard, Uses } from "@metaplex-foundation/mpl-token-metadata";

export interface NFTInfo {
  metadataAddress: string;
  updateAuthorityAddress: string;
  mintAddress: string;
  name: string;
  symbol: string;
  uri: string;
  sellerFeeBasisPoints: number;
  creators?: Creator[];
  primarySaleHappened: boolean;
  isMutable: boolean;
  editionNonce?: number;
  tokenStandard?: TokenStandard;
  collection?: Collection | null;
  uses?: Uses | null;
  uriMetadata: JsonMetadata;

  // gen by SolFren
  candyMachineId?: string;
  collectionInfo?: CollectionInfo;
}

export interface CollectionInfo {
  collectionId: string; // uid gen by SolFren, from 1. Collection.key or 2. CandyMachineId
  collectionKey?: string;
  candyMachineId?: string;
  symbol: string;
  name: string;
  description?: string;
  image?: string;
  createdAt?: Date;
  website?: string;
  discord?: string;
  twitter?: string;
  categories?: string[];
  totalItems?: number;
  parentCollectionId?: string; // prepare for nested collections (metaplex v1.3)
}

/**
<<<<<<< HEAD
 * NFT Transaction
=======
 * NFT Transaction
>>>>>>> e2c2a00 (feat(protocols): solfren api)
 */

export interface SolNFTTransaction {
  signature: string;
  signer: string;
  ownerAddress: string;
  targetAddress?: string;
  transType: TransactionType;
  method: SaleMethod;
  transfers: Transfer[];
  timestamp: Date;
  nftInfo: NFTInfo;
}

export interface Transfer {
  from: string;
  to: string;
  revenue: {
    amount: number;
    symbol: string;
  };
}

export enum TransactionType {
  Trade = "trade",
  Mint = "mint",
  Transfer = "transfer",
  Airdrop = "airdrop", //TODO: define by SolFren
  OwnerPost = 'ownerPost', // defined by SolFren
}

export enum SaleMethod {
  Direct = "direct",
  Bid = "bid",
}

export interface SolNFTTransSale extends SolNFTTransaction {
  marketplace?: string;
  candyMachineId?: string;
  priceInLamport: number;
  price: number;
}

export interface SolNFTTransOwnerPost extends SolNFTTransaction {
  message: string;
}
