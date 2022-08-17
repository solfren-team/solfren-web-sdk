import Profile from '../src/modules/profile';

(async () => {
  const profile = new Profile({
    solFrenAPI: {
      apiKey: "X0ZVQ2ZZSUJ1c2ZkYW5GWm1nR1I6Nm00YU1JamZUbGE1dlExekkyZzRWQQ=="
    },
    solanaRPC: {
      endpoint: 'https://fragrant-long-dew.solana-mainnet.quiknode.pro/9329f6a9639c876d87e0bbe53c8fb39925555012'
    },
    wonkaAPI: {
      endpoint: 'https://api.wonkalabs.xyz/v0.1/solana/mainnet/graphql',
    },
  });
  const profileResp = await profile.get('the-wallet-address');
  console.log('profile', profileResp);
})()
