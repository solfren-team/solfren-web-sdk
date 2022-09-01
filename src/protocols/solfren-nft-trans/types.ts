import { NFTInfo } from "../solfren-nft/types";

export enum SaleMethod {
  Direct = "direct",
  Bid = "bid",
}

export enum TransactionType {
  Trade = "trade",
  Mint = "mint",
  Transfer = "transfer",
  Airdrop = "airdrop", // TODO: define by SolFren
}

export interface Transfer {
  from: string;
  to: string;
  revenue: {
    amount: number;
    symbol: string;
  };
}

export interface Transaction {
  signature: string;
  signer: string;
  ownerAddress: string;
  targetAddress?: string;
  transType: TransactionType;
  method: SaleMethod;
  transfers: Transfer[];
  timestamp: Date;
  nftInfo: NFTInfo;
  marketplace?: string;
  candyMachineId?: string;
  priceInLamport: number;
  price: number;
}

