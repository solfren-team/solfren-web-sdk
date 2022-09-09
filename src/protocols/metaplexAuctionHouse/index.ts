import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { AuctionHouse, formatAmount, keypairIdentity, lamports, Metadata, Metaplex, MetaplexPlugin, Nft, sol, token, WalletAdapter, walletAdapterIdentity } from '@metaplex-foundation/js'

export default class MetaplexAuctionHouse {
  private conn: Connection;
  private auctionHouseKey: PublicKey;
  private auctionHouse?: AuctionHouse;
  private mx: Metaplex;

  public constructor(endpoint: string, auctionHouseAddress: string) {
    this.conn = new Connection(
      endpoint,
      { commitment: 'confirmed' }
    );
    this.auctionHouseKey = new PublicKey(auctionHouseAddress);
    this.mx = Metaplex.make(this.conn);
  }

  private async getAuctionHouse() {
    if (!this.auctionHouse) {
      this.auctionHouse = await this.mx
        .auctions()
        .findAuctionHouseByAddress(this.auctionHouseKey).run()
    }
    return this.auctionHouse;
  }

  public async listPrice(
    walletIdentity: MetaplexPlugin,
    sellerAddress: string,
    mintAddress: string,
    price: number
  ) {
    const ah = await this.getAuctionHouse();
    const resp = await this.mx
      .use(walletIdentity)
      .auctions()
      .for(ah)
      .list({
        mintAccount: new PublicKey(mintAddress),
        seller: new PublicKey(sellerAddress),
        price: sol(price),
        tokens: token(1)
      })
      .run()
    return resp;
  }

  public async makeOffer(
    walletIdentity: MetaplexPlugin,
    buyerAddress: string,
    mintAddress: string,
    price: number
  ) {
    const ah = await this.getAuctionHouse();
    const resp = await this.mx
      .use(walletIdentity)
      .auctions()
      .for(ah)
      .bid({
        mintAccount: new PublicKey(mintAddress),
        buyer: new PublicKey(buyerAddress),
        price: sol(price),
        tokens: token(1)
      })
      .run()
    return resp;
  }

  public async instantBuy(
    walletIdentity: MetaplexPlugin,
    buyerAddress: string,
    listingTradeStateAddress: string,
    mintAddress: string,
    price: number
  ) {
    const ah = await this.getAuctionHouse();
    const ahClient = this.mx
      .use(walletIdentity)
      .auctions()
      .for(ah)
    const listing = await ahClient
      .findListingByAddress(new PublicKey(listingTradeStateAddress))
      .run();
    const bidResp = await ahClient
      .bid({
        mintAccount: new PublicKey(mintAddress),
        buyer: new PublicKey(buyerAddress),
        price: sol(price),
        tokens: token(1)
      })
      .run()
    const executeResp = ahClient
      .executeSale({
        listing: listing,
        bid: bidResp.bid
      })
      .run();
    return executeResp;
  }

  public async instantSell(
    walletIdentity: MetaplexPlugin,
    sellerAddress: string,
    biddingTradeStateAddress: string,
    mintAddress: string,
    price: number
  ) {
    const ah = await this.getAuctionHouse();
    const ahClient = this.mx
      .use(walletIdentity)
      .auctions()
      .for(ah)
    const bidding = await ahClient
      .findBidByTradeState(new PublicKey(biddingTradeStateAddress))
      .run();
    const listingResp = await ahClient
      .list({
        mintAccount: new PublicKey(mintAddress),
        seller: new PublicKey(sellerAddress),
        price: sol(price),
        tokens: token(1)
      })
      .run()
    const executeResp = await ahClient
      .executeSale({
        listing: listingResp.listing,
        bid: bidding
      })
      .run();
    return executeResp;
  }
}
