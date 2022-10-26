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
  const walletAddress = '2NoEcR9cC7Rn6bP9rBpky6B1eP9syyPf8FXRaf1myChv';

  {
    const profileResp = await profile.get(walletAddress);
    console.log('profile', profileResp);
  }

  {
    const resp = await profile.listFollowers(walletAddress, 2);
    console.log('followers', resp);
  }

  {
    const resp = await profile.listFollowings(walletAddress, 2);
    console.log('followings', resp);
  }
})()
