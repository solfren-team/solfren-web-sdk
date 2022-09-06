import assert from 'assert';
import { Config } from '../../types';
import { ProfileItem, Twitter } from './types';
import CyberConnect from '../../protocols/cyberconnect';
import SolFrenWallet from '../../protocols/solfren-wallet';
import { WalletInfo } from '../../protocols/solfren-wallet/types';
import TwitterAPI from '../../protocols/twitter';
import WonkaAPI from '../../protocols/wonka';

export default class Profile {
  private solFrenWallet: SolFrenWallet;
  private wonkaAPI: WonkaAPI;
  private twitterAPI: TwitterAPI;
  private cyberConnect: CyberConnect;

  public constructor(config: Config) {
    assert(config?.solFrenAPI?.apiKey);
    assert(config?.wonkaAPI?.endpoint);
    assert(config?.twitter?.apiKey);
    assert(config?.cyberConnect?.endpoint);

    this.solFrenWallet = new SolFrenWallet(config.solFrenAPI.apiKey);
    this.wonkaAPI = new WonkaAPI(config.wonkaAPI.endpoint);
    this.twitterAPI = new TwitterAPI(config.twitter.apiKey);
    this.cyberConnect = new CyberConnect(config.cyberConnect.endpoint)
  }

  public async get(walletAddress: string): Promise<ProfileItem> {
    let wallet = await this.solFrenWallet.getWallet(walletAddress);
    if (!wallet.twitterHandle || !wallet.solanaDomain) {
      wallet = await this.syncWithBonfida(wallet);
    }

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

    const followingInfo = await this.cyberConnect.getFollowingCount(walletAddress);

    return {
      wallet: {
        address: walletAddress,
        name: wallet.name,
        description: wallet.description,
        twitterHandle: wallet.twitterHandle,
        twitter,
        solanaDomain: wallet.solanaDomain,
        achievements: wallet.achievements,
        selectedAvatarNFT: {
          name: wallet.selectedAvatarNFT?.name,
          imageUrl: wallet.selectedAvatarNFT?.image_url,
        },
        followerCount: followingInfo?.followerCount,
        followingCount: followingInfo?.followingCount,
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

  private async syncWithBonfida(walletInfo: WalletInfo): Promise<WalletInfo> {
    const resp = await this.wonkaAPI.fetchSolDomainMetadata(walletInfo.walletAddress);
    if (!resp) {
      return walletInfo;
    }

    walletInfo.twitterHandle = resp.twitter;
    walletInfo.solanaDomain = resp.solName;
    if (resp.twitter) {
      walletInfo.twitterInfo = await this.twitterAPI.getTwitterInfo(resp.twitter);
    }

    try {
      await this.solFrenWallet.upsertWallet({
        walletAddress: walletInfo.walletAddress,
        twitterHandle: walletInfo.twitterHandle,
        twitterInfo: walletInfo.twitterInfo,
        solanaDomain: walletInfo.solanaDomain,
      } as WalletInfo);
    } catch (err) {
      console.error('failed to upsertWallet', err);
    }

    return walletInfo;
  }
}
