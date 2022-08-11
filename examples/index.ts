import MagicEden from '../src/marketplaces/magicEden'
import SolFrenSDK from '../src/index'

(async () => {
  const solFrenSDK = new SolFrenSDK({
    solFrenAPI: {
      apiKey: "X0ZVQ2ZZSUJ1c2ZkYW5GWm1nR1I6Nm00YU1JamZUbGE1dlExekkyZzRWQQ=="
    }
  })
  console.log('NFTFeed.listByDiscover()', await solFrenSDK.getNFTFeed().listByDiscover());

  const me = new MagicEden();

  const tokenMetadata = await me.getTokenMetadata('81LJ3k314z2uS7G3Upza7SNEKEuJc3BtDGia9yQ3i3sz');
  console.log(tokenMetadata);

  const collection = await me.getCollection(tokenMetadata!.collection)
  console.log(collection)
})()
