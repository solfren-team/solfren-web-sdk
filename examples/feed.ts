import { FeedItem, NFTFeed } from '../src/feed';
import { Client } from '@elastic/elasticsearch'

(async () => {
    const esClient = new Client({
        node: 'http://joe.onedoggo.com:9200',
        auth: {
            // apiKey: "LWs2aWU0SUJ1c2ZkYW5GWnZvWHI6RkU0ajFfR3lUdUtqbmp1TW9vTHVoUQ=="
            apiKey: "QlU2c2U0SUJ1c2ZkYW5GWk9MQno6ckoxbWNxYmFUN0dZbi1UbDR5ZnFpUQ==" //root
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
  