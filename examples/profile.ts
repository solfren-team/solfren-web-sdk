import Profile from '../src/modules/profile';

(async () => {
  const profile = new Profile({
    solFrenAPI: {
      apiKey: "X0ZVQ2ZZSUJ1c2ZkYW5GWm1nR1I6Nm00YU1JamZUbGE1dlExekkyZzRWQQ=="
    }
  });
  const profileResp = await profile.get('the-wallet-address');
  console.log('profile', profileResp);
})()
