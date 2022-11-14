export type Follow = {
  walletAddress: string;
}

export const enum FollowType {
  Wallet = 'Wallet',
  NFT = 'NFT',
  Collection = "Collection",
}
