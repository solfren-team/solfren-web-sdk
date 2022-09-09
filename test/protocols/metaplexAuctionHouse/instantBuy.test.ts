import test, { Test } from 'tape';
import spok, { Specifications } from 'spok';
import { Keypair } from '@solana/web3.js'
import { connection, devNetEndpoint, auctionHouseAddress, getSellerWallet, getBuyerWallet, createCollectionNft } from './helpers';
import { keypairIdentity, Metaplex, mockStorage, WalletAdapter } from '@metaplex-foundation/js';

import MetaplexAuctionHouse from '../../../src/protocols/metaplexAuctionHouse'

test('[metaplexAuctionHouse] instant buy with the same price.', async (t: Test) => {
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

  console.debug("listing price.")
  const listResp = await auctionHouse.listPrice(
    keypairIdentity(sellerWallet),
    sellerWallet.publicKey.toBase58(),
    nft.mint.address.toBase58(),
    price
  )

  console.log(`listed NFT:[${nft.mint.address.toBase58()}] signature:[${listResp.response.signature}] listTradeStateAddr:[${listResp.listing.tradeStateAddress.toBase58()}] sellerTradeState:[${listResp.sellerTradeState.toBase58()}]`)

  console.debug("instant buying...")
  const instantBuyResp = await auctionHouse.instantBuy(
    keypairIdentity(buyerWallet),
    buyerWallet.publicKey.toBase58(),
    listResp.sellerTradeState.toBase58(),
    nft.mint.address.toBase58(),
    price
  )

  console.log(`bought NFT:[${nft.mint.address.toBase58()}] signature:[${instantBuyResp.response.signature}] sellerTradeState:[${instantBuyResp.sellerTradeState.toBase58()}]`)

  t.ok( instantBuyResp.receipt != null , "instant buy recept not null.")
});