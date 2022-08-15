import Collection from '../src/modules/collection';

(async () => {
  const collection = new Collection({
    solFrenAPI: {
      apiKey: "X0ZVQ2ZZSUJ1c2ZkYW5GWm1nR1I6Nm00YU1JamZUbGE1dlExekkyZzRWQQ=="
    },
    solanaRPC: {
      endpoint: 'https://fragrant-long-dew.solana-mainnet.quiknode.pro/9329f6a9639c876d87e0bbe53c8fb39925555012'
    }
  });

  const id = 'HhDDF8djnQnty2WJTxsy5VRNMutbPPd5xCtujieHBPAu'; // collection key

  {
    const resp = await collection.get(id);
    console.log(resp);
  }

  {
    const resp = await collection.listItems(id);
    console.log(resp);
  }
})()
