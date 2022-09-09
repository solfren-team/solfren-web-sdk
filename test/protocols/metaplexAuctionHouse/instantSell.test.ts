import test, { Test } from 'tape';
import spok, { Specifications } from 'spok';
import { Keypair } from '@solana/web3.js'
import { connection, devNetEndpoint, auctionHouseAddress, getSellerWallet, getBuyerWallet, createCollectionNft } from './helpers';
import { keypairIdentity, Metaplex, mockStorage, WalletAdapter } from '@metaplex-foundation/js';

import MetaplexAuctionHouse from '../../../src/protocols/metaplexAuctionHouse'

test('[metaplexAuctionHouse] instant sell with the same price.', async (t: Test) => {
  const mx = Metaplex.make(connection);

  console.debug("prepare seller wallet.")
  const seller = await getSellerWallet(mx);
  const sellerWallet = Keypair.fromSecretKey(seller.secretKey);

  console.debug(`creating NFT for wallet:[${seller.publicKey}].`)
  const nft = await createCollectionNft(
    mx.use(keypairIdentity(sellerWallet)).use(mockStorage()),
    {
      tokenOwner: seller.publicKey,
      name: "InstantBuyTestNFT"
    }
  )

  console.debug("prepare buyer wallet.")
  const buyer = getBuyerWallet(mx);
  const buyerWallet = Keypair.fromSecretKey((await buyer).secretKey);
  const price = 1;

  const auctionHouse = new MetaplexAuctionHouse(
    devNetEndpoint,
    auctionHouseAddress
  )

  console.debug("make offer.")
  const bidResp = await auctionHouse.makeOffer(
    keypairIdentity(buyerWallet),
    buyerWallet.publicKey.toBase58(),
    nft.mint.address.toBase58(),
    price
  )

  console.log(`bidding NFT:[${nft.mint.address.toBase58()}] signature:[${bidResp.response.signature}] listTradeStateAddr:[${bidResp.bid.tradeStateAddress.toBase58()}] buyerTradeState:[${bidResp.buyerTradeState.toBase58()}]`)

  console.debug("instant selling...")
  const instantSellResp = await auctionHouse.instantSell(
    keypairIdentity(sellerWallet),
    sellerWallet.publicKey.toBase58(),
    bidResp.buyerTradeState.toBase58(),
    nft.mint.address.toBase58(),
    price
  )

  console.log(`sold NFT:[${nft.mint.address.toBase58()}] signature:[${instantSellResp.response.signature}] sellerTradeState:[${instantSellResp.sellerTradeState.toBase58()}]`)

  t.ok( instantSellResp.receipt != null , "instant sell recept not null.")
});