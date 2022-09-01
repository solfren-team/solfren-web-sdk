import Collection from '../src/modules/collection';

(async () => {
  const collection = new Collection({
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
    const resp = await collection.get(id);
    console.log(resp);
  }

  {
    const [nfts, cursor] = await collection.listNfts(id);
    console.log(nfts);
    console.log(cursor);
  }

  {
    const resp = await collection.listActivities(id);
    console.log(resp.activities);
    console.log(resp.cursor);
  }
})()
