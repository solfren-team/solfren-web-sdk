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
    simpleHash: {
      key: ''
    }
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
    const resp = await nft.listActivitiesByCollection(id, 1);
    console.log(resp.activities);
  }

  {
    const [nfts, cursor] = await nft.listByWallet('6zsuBDfuvtxK5FD9tf8u8LfrYBVnxDWRhj43snmC6Qx6');
    console.log(nfts);
    console.log(cursor);
  }

  {
    let cursor;
    for (let i = 0; i < 2; i++) {
      const resp = await nft.listCollections(1, cursor);
      if (resp.hasNextPage) {
        cursor = resp.collections[resp.collections.length - 1]
      }
      console.log(resp.collections);
    }
  }

  {
    const id = 'HpADAcJVfqtDjGjKTcGEs7gMSdjfjYAdtMH3UL8KNkmX';
    const resp = await nft.createCollectionComment(id, 'test-author-address', 'test-content');
    console.log(resp);
  }

  {
    const id = 'HpADAcJVfqtDjGjKTcGEs7gMSdjfjYAdtMH3UL8KNkmX';
    const resp = await nft.listCollectionComments(id);
    console.log(resp);
  }
})()
