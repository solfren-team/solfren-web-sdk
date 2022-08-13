import assert from 'assert';
import { Config } from '../../types';
import SolFrenWallet from '../../protocols/solfren-wallet';
import { ProfileItem, Twitter } from './types';

export default class Profile {
  private solFrenWallet: SolFrenWallet;

  public constructor(config: Config) {
    assert(config?.solFrenAPI?.apiKey);

    this.solFrenWallet = new SolFrenWallet(config.solFrenAPI.apiKey);
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

    const topProfile = await this.solFrenWallet.getTopVolume(walletAddress);
    const topDiversity = await this.solFrenWallet.getTopDiversity(walletAddress);
    const topTradingFreq = await this.solFrenWallet.getTopTradingFreq(walletAddress);

    // Random Select Avatar NFT if no WalletInfo.selectedAvatarNFT
    if (!wallet.selectedAvatarNFT && topDiversity && topDiversity.topHits.length > 0) {
      const nftInfo = topDiversity.topHits[Math.floor(Math.random() * topDiversity.topHits.length)].nftInfo;
      wallet.selectedAvatarNFT = {
        name: nftInfo.name,
        image_url: nftInfo.uriMetadata.image ?? '',
      }
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
      statistics: {
        volume30DaysSum: topProfile?.sum ?? 0,
        hodlDaysSum: 0,
        collectionCount: topDiversity?.collectionCount ?? 0,
        nftCount: topDiversity?.nftCount ?? 0,
        trade30DaysCount: topTradingFreq?.count ?? 0,
      },
    } as ProfileItem;
  };
}
