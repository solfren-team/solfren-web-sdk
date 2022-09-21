import NFT from '../src/modules/nft';

(async () => {
  const nft = new NFT({
    solFrenAPI: {
      apiKey: "X0ZVQ2ZZSUJ1c2ZkYW5GWm1nR1I6Nm00YU1JamZUbGE1dlExekkyZzRWQQ=="
    },
    solanaRPC: {
      endpoint: 'https://api.mainnet-beta.solana.com'
    },
    wonkaAPI: {
      endpoint: 'https://api.wonkalabs.xyz/v0.1/solana/mainnet/graphql',
    },
  });

  const id = 'HhDDF8djnQnty2WJTxsy5VRNMutbPPd5xCtujieHBPAu'; // collection key

  {
    const resp = await nft.getCollection(id);
    console.log(resp);
  }

  {
    const [nfts, cursor] = await nft.listByCollection(id);
    console.log(nfts);
    console.log(cursor);
  }

  {
    const resp = await nft.listActivities(id);
    console.log(resp.activities);
    console.log(resp.cursor);
  }

  {
    const resp = await nft.createCollectionComment(id, 'test-author-address', 'test-content');
    console.log(resp);
  }
})()
