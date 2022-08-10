import { FeedItem, NFTFeed } from '../src/modules/feed';

(async () => {
    const feed = new NFTFeed({
        solFrenAPI: {
            apiKey: "X0ZVQ2ZZSUJ1c2ZkYW5GWm1nR1I6Nm00YU1JamZUbGE1dlExekkyZzRWQQ=="
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
  