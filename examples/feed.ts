import { NFTFeed } from '../src/modules/feed';

(async () => {
  const feed = new NFTFeed({
    solFrenAPI: {
      apiKey: "X0ZVQ2ZZSUJ1c2ZkYW5GWm1nR1I6Nm00YU1JamZUbGE1dlExekkyZzRWQQ=="
    },
    solanaRPC: {
      endpoint: 'https://fragrant-long-dew.solana-mainnet.quiknode.pro/9329f6a9639c876d87e0bbe53c8fb39925555012'
    }
  });
  const discoverFeeds = await feed.listByDiscover();
  console.log('discoverFeeds', discoverFeeds);

  const followingFeeds = await feed.listByFollowing(0, 20, [
    "GghH4bzBCL5LPT7pQb61K38U692unuJcdMyagJsbrXBp",
    "HEy7vnGUAhH5wdd8EDzEupfM3wTDsmPRAxNyrC31k4x",
    "CydboaUkUHWgneFXdECFUsZEwNEPTuZEyvmcv6VTsGHY"
  ]);
  console.log('followingFeeds', followingFeeds);
})()
