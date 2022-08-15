import SolFrenSDK from '../src/index'

(async () => {
  const solFrenSDK = new SolFrenSDK({
    solFrenAPI: {
      apiKey: "X0ZVQ2ZZSUJ1c2ZkYW5GWm1nR1I6Nm00YU1JamZUbGE1dlExekkyZzRWQQ=="
    },
    solanaRPC: {
      endpoint: 'https://fragrant-long-dew.solana-mainnet.quiknode.pro/9329f6a9639c876d87e0bbe53c8fb39925555012'
    }
  })
  console.log('NFTFeed.listByDiscover()', await solFrenSDK.getNFTFeed().listByDiscover());
})()
