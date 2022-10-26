# solfren-web-sdk

SolFren, a social platform aim to make developer build Web3 Dapp easiler.
`solfren-web-sdk` is a Javascript SDK provides many NFT social related modules which are composited by underlying web3 protocols.

## Architecture

![SolFren Architecture](https://imgur.com/FVPEu2q.png)

Welcome to join our [Discord](https://discord.gg/D3rRx7zh) for more design and implementation discussion.

## Installation

Checkout SolFren Web SDK latest [release](https://github.com/solfren-team/solfren-web-sdk/releases).

```
npm install @solfrenxyz/solfren-web-sdk
```

## Usage

```
import SolFrenSDK from '../src/index'

const solFrenSDK = new SolFrenSDK({
  solFrenAPI: {
    apiKey: "X0ZVQ2ZZSUJ1c2ZkYW5GWm1nR1I6Nm00YU1JamZUbGE1dlExekkyZzRWQQ=="
  },
})
console.log('NFTFeed.listByDiscover()', await solFrenSDK.getNFTFeed().listByDiscover());
```

### Social Feed

```
import { NFTFeed } from '../src/modules/feed';

const feed = new NFTFeed({
  solFrenAPI: {
    apiKey: "X0ZVQ2ZZSUJ1c2ZkYW5GWm1nR1I6Nm00YU1JamZUbGE1dlExekkyZzRWQQ=="
  },
});
const discoverFeeds = await feed.listByDiscover();
console.log('discoverFeeds', discoverFeeds);

const followingFeeds = await feed.listByFollowing(0, 20, [
  "GghH4bzBCL5LPT7pQb61K38U692unuJcdMyagJsbrXBp",
  "HEy7vnGUAhH5wdd8EDzEupfM3wTDsmPRAxNyrC31k4x",
  "CydboaUkUHWgneFXdECFUsZEwNEPTuZEyvmcv6VTsGHY"
]);
console.log('followingFeeds', followingFeeds);

```

### Profile

```
import Profile from '../src/modules/profile';

const profile = new Profile({
  solFrenAPI: {
    apiKey: 'X0ZVQ2ZZSUJ1c2ZkYW5GWm1nR1I6Nm00YU1JamZUbGE1dlExekkyZzRWQQ==',
  },
  wonkaAPI: {
    endpoint: 'https://api.wonkalabs.xyz/v0.1/solana/mainnet/graphql',
  },
  twitter: {
    apiKey: '{YOUR_TWITTER_API_KEY}',
  },
});
const profileResp = await profile.get('the-wallet-address');
console.log('profile', profileResp);

```

### NFT Module

```
import NFT from '../src/modules/nft';

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
```