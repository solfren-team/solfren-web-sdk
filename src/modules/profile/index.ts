import { Options } from '../../options';
import SolFrenWallet from '../../protocols/solfren-wallet';
import { ProfileItem, Twitter } from './types';

export default class Profile {
  private solFrenWallet: SolFrenWallet;

  public constructor(options: Options) {
    if (options.solFrenAPI == undefined) {
      throw new Error('NFTFeed: must provide SolFrenWallet.apiKey');
    }
    this.solFrenWallet = new SolFrenWallet(options.solFrenAPI.apiKey);
  }

  public async get(walletAddress: string): Promise<ProfileItem> {
    const wallet = await this.solFrenWallet.getWallet(walletAddress);

    let twitter: Twitter | undefined;
    if (wallet.twitterInfo) {
      twitter = {
        id: wallet.twitterInfo.id,
        name: wallet.twitterInfo.name,
        description: wallet.twitterInfo.description,
        profileImageUrl: wallet.twitterInfo.profile_image_url,
        location: wallet.twitterInfo.location,
        username: wallet.twitterInfo.username,
        verified: wallet.twitterInfo.verified,
        publicMetrics: {
          followersCount: wallet.twitterInfo.public_metrics.followers_count,
          followingCount: wallet.twitterInfo.public_metrics.following_count,
          tweetCount: wallet.twitterInfo.public_metrics.tweet_count,
          listedCount: wallet.twitterInfo.public_metrics.listed_count,
        }
      } as Twitter;
    }

    return {
      wallet: {
        address: walletAddress,
        name: wallet.name,
        description: wallet.description,
        twitterHandle: wallet.twitterHandle,
        twitter,
        solanaDomain: wallet.solanaDomain,
        followering: wallet.followering,
        followers: wallet.followers,
        achievements: wallet.achievements,
        selectedAvatarNFT: {
          name: wallet.selectedAvatarNFT?.name,
          imageUrl: wallet.selectedAvatarNFT?.image_url,
        }
      },
    } as ProfileItem;
  }
}
