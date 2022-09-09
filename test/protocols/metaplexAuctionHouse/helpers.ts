import { Connection, Keypair, clusterApiUrl } from '@solana/web3.js';
import { CreateNftInput, Metaplex, Nft, sol, UploadMetadataInput } from '@metaplex-foundation/js';

export const devNetEndpoint = clusterApiUrl("devnet");

export const connection = new Connection(
  devNetEndpoint,
  { commitment: 'confirmed' }
);

export const auctionHouseAddress = "9z666zc3Pm7h5XzK2wFxLDFUse7kxF53ms932US5RemR"

export const getSellerWallet = async (
  mx: Metaplex,
  solsToAirdrop: number = 0
): Promise<Keypair> => {
  // 7QC5ZAWYxakGRbcUFjG8My1Dg4HRMCrEqRQp9kybF7kT
  const walletPriKey = Uint8Array.from([10,224,41,137,184,128,132,10,52,185,142,182,166,153,212,216,144,21,167,157,127,67,153,222,172,5,181,220,108,65,102,146,95,23,1,182,228,94,200,71,76,218,5,195,48,121,102,148,177,205,137,166,24,99,93,2,57,186,0,142,23,102,19,192]);
  const wallet = Keypair.fromSecretKey(walletPriKey);
  if(solsToAirdrop > 0) {
    const airdropResp = await connection.requestAirdrop(wallet.publicKey, sol(solsToAirdrop).basisPoints.toNumber());
    console.debug(`airdrop to [${wallet.publicKey}] resp:[${airdropResp}]`);
  }
  return wallet;
} //createWallet(mx, solsToAirdrop)

export const getBuyerWallet = async (
  mx: Metaplex,
  solsToAirdrop: number = 0
): Promise<Keypair> => {
  // Egu83sufo3ZdvwAo8MUN2YPX2jRuJ9aUzmBoRhLMPUvu
  const walletPriKey = Uint8Array.from([84,141,236,173,216,165,47,152,248,199,175,133,127,138,94,119,163,189,94,150,102,91,201,33,189,171,152,198,78,83,186,45,203,96,131,255,95,155,140,37,233,29,167,180,126,73,36,234,138,250,85,17,191,34,107,75,175,42,145,255,123,21,254,146]);
  const wallet = Keypair.fromSecretKey(walletPriKey);
  if(solsToAirdrop > 0) {
    const airdropResp = await connection.requestAirdrop(wallet.publicKey, sol(solsToAirdrop).basisPoints.toNumber());
    console.debug(`airdrop to [${wallet.publicKey}] resp:[${airdropResp}]`);
  }
  return wallet;
} //createWallet(mx, solsToAirdrop)

/**
 * NOTICE: use airdrop high frequently will cause 429 error, thereforce reuse the wallet in most test cases.
 * @param mx 
 * @param solsToAirdrop 
 * @returns 
 */
export const createWallet = async (
  mx: Metaplex,
  solsToAirdrop: number = 2
): Promise<Keypair> => {
  const wallet = Keypair.generate();
  const airdropResp = await connection.requestAirdrop(wallet.publicKey, sol(solsToAirdrop).basisPoints.toNumber());
  console.debug(`airdrop to [${wallet.publicKey}] resp:[${airdropResp}]`);
  return wallet;
};

/**
 * usage:
 *  - const nft = await createNft(mx, { name: 'Some NFT' });
 *  - const someOnesNft = await createNft(mx, { tokenOwner: seller.publicKey });
 * @param input 
 * @returns 
 */
export const createNft = async (
  mx: Metaplex,
  input: Partial<CreateNftInput & { json: UploadMetadataInput }> = {}
): Promise<Nft> => {

  console.log("uploading metadata.")
  const { uri } = await mx
    .nfts()
    .uploadMetadata(input.json ?? {})
    .run();

  console.log("creating nft.")
  const { nft } = await mx
  .nfts()
  .create({
    uri,
    name: 'Test NFT',
    sellerFeeBasisPoints: 200,
    ...input,
  })
  .run();

  return nft;
}

export const createCollectionNft = (
  mx: Metaplex,
  input: Partial<CreateNftInput & { json: UploadMetadataInput }> = {}
) => createNft(mx, { ...input, isCollection: true });