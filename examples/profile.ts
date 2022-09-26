import Profile from '../src/modules/profile';

(async () => {
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
    cyberConnect: {
      endpoint: 'https://api.cybertino.io/connect/',
    },
  });
  const profileResp = await profile.get('2NoEcR9cC7Rn6bP9rBpky6B1eP9syyPf8FXRaf1myChv');
  console.log('profile', profileResp);
})()
