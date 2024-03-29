import { NFTInfo } from "../../protocols/solfren-nft/types"; //TODO: decouple protocol type
import { Wallet } from "../profile/types";

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
    ownerWalletInfo?: Wallet,

    // for Trade Item
    marketplace?: string;
    candyMachineId?: string;
    price?: number,
    action?: Action,

    // for Owner Post
    message?: string,
}