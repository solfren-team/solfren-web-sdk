import { FeedItem, NFTFeed } from '../src/feed';
import { Client } from '@elastic/elasticsearch'

(async () => {
    const esClient = new Client({
        node: 'http://joe.onedoggo.com:9200',
        auth: {
            apiKey: "X0ZVQ2ZZSUJ1c2ZkYW5GWm1nR1I6Nm00YU1JamZUbGE1dlExekkyZzRWQQ=="
        }
    });
    const feed = new NFTFeed(esClient);
    const discoverFeeds = await feed.getFeedsByDiscover();
    console.log('discoverFeeds', discoverFeeds);

    const followingFeeds = await feed.getFeedsByFollowing(0, 20, [
        "GghH4bzBCL5LPT7pQb61K38U692unuJcdMyagJsbrXBp",
        "HEy7vnGUAhH5wdd8EDzEupfM3wTDsmPRAxNyrC31k4x",
        "CydboaUkUHWgneFXdECFUsZEwNEPTuZEyvmcv6VTsGHY"
    ]);
    console.log('followingFeeds', followingFeeds);
  })()
  