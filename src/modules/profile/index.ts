import { ProfileItem } from './types';

export default class Profile {
  public async get(address: string): Promise<ProfileItem> {
    return {
      wallet: {
        address,
        name: '',
        description: '',
        twitterHandle: '',
        twitter: {
          id: '',
          name: '',
          description: '',
          profileImageUrl: '',
          location: '',
          username: '',
          verified: false,
          publicMetrics: {
            followersCount: 0,
            followingCount: 0,
            tweetCount: 0,
            listedCount: 0,
          }
        },
        solanaDomain: '',
        followering: [''],
        followers: 0,
        achievements: [''],
        selectedAvatarNFT: {
          name: '',
          imageUrl: '',
        }
      },
      statistics: {
        volume30DaysSum: 0,
        hodlDaysSum: 0,
        collectionCount: 0,
        nftCount: 0,
        trade30DaysCount: 0,
      },
    } as ProfileItem
  }
}
