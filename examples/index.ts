import MagicEden from '../src/marketplaces/magicEden'

(async () => {
  const me = new MagicEden();

  const tokenMetadata = await me.getTokenMetadata('81LJ3k314z2uS7G3Upza7SNEKEuJc3BtDGia9yQ3i3sz');
  console.log(tokenMetadata);

  const collection = await me.getCollection(tokenMetadata!.collection)
  console.log(collection)
})()
