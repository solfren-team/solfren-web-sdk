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
      apiKey: 'AAAAAAAAAAAAAAAAAAAAAFoLawEAAAAARjKss%2BTwiqey0ZrxFvsn%2BRsnX20%3Dbil5P0G83pjkXwMYhECcgkhiG4uqXlgWnS4fXO29RwefPLP66R',
    },
  });
  const profileResp = await profile.get('the-wallet-address');
  console.log('profile', profileResp);
})()
