import { NFTInfo } from "../../protocols/solfren-nft"; //TODO: decouple protocol type
import { WalletInfo } from "../wallet";

export const enum FeedType {
    Trade = "trade",
    Mint = "mint",
    Transfer = "transfer",
    Airdrop = "airdrop", // define by SolFren
    OwnerPost = 'ownerPost', // defined by SolFren
}

export const enum Action {
    Buy = "buy",
    Sell = "sell",
}

export interface FeedItem {
    feedType: FeedType,
    signature: string,
    ownerAddress: string,
    targetAddress: string,
    timestamp: Date,

    nftInfo?: NFTInfo,
    ownerWalletInfo?: WalletInfo,

    // for Trade Item
    marketplace?: string;
    candyMachineId?: string;
    price?: number,
    action?: Action,

    // for Owner Post
    message?: string,
}