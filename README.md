# solfren-web-sdk

## Installation

```
npm install @solfrenxyz/solfren-web-sdk
```

## Example

```
  const solFrenSDK = new SolFrenSDK({
    solFrenAPI: {
      apiKey: "{YOUR_API_KEY}"
    }
  })

  const discoverFeeds = await solFrenSDK.getNFTFeed().listByDiscover();
  console.log('NFTFeed.listByDiscover()', discoverFeeds);

  const profileResp = await profile.get('the-wallet-address');
  console.log('profile', profileResp);
```