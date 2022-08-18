import SolFrenSDK from '../src/index'

(async () => {
  const solFrenSDK = new SolFrenSDK({
    solFrenAPI: {
      apiKey: "X0ZVQ2ZZSUJ1c2ZkYW5GWm1nR1I6Nm00YU1JamZUbGE1dlExekkyZzRWQQ=="
    },
  })
  console.log('NFTFeed.listByDiscover()', await solFrenSDK.getNFTFeed().listByDiscover());
})()
