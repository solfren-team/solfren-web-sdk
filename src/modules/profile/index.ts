import assert from 'assert';
import { Config } from '../../types';
import { ListFollowersResponse, ListFollowingsResponse, ProfileItem, Twitter, Wallet } from './types';
import SolFrenWallet from '../../protocols/solfren-wallet';
import { WalletInfo } from '../../protocols/solfren-wallet/types';
import TwitterAPI from '../../protocols/twitter';
import WonkaAPI from '../../protocols/wonka';
import { PublicKey } from '@solana/web3.js';
import SolFrenFollow from '../../protocols/solfren-follow';
import { FollowType } from '../../protocols/solfren-follow/types';

export default class Profile {
  private solFrenFollow: SolFrenFollow;
  private solFrenWallet: SolFrenWallet;
  private wonkaAPI: WonkaAPI;
  private twitterAPI: TwitterAPI;

  public constructor(config: Config) {
    assert(config?.solFrenAPI?.apiKey);
    assert(config?.solFrenAPI?.follow.endpoint);
    assert(config?.solFrenAPI?.follow.username);
    assert(config?.solFrenAPI?.follow.password);
    assert(config?.wonkaAPI?.endpoint);
    assert(config?.twitter?.apiKey);

    this.solFrenFollow = new SolFrenFollow(config.solFrenAPI.follow.endpoint, config.solFrenAPI.follow.username, config.solFrenAPI.follow.password);
    this.solFrenWallet = new SolFrenWallet(config.solFrenAPI.apiKey);
    this.wonkaAPI = new WonkaAPI(config.wonkaAPI.endpoint);
    this.twitterAPI = new TwitterAPI(config.twitter.apiKey);
  }

  public async get(walletAddress: string): Promise<ProfileItem> {
    // check walletAddress is a valid address.
    const walletAddressKey = new PublicKey(walletAddress);
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
        followerCount: await this.solFrenFollow.countFollowers(walletAddress, FollowType.Wallet),
        followingCount: await this.solFrenFollow.countFollowings(walletAddress, FollowType.Wallet),
        github: undefined, // deprecated
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

  public async listWallets(walletAddresses: string[]): Promise<Map<string, Wallet>> {
    const wallets = new Map<string, Wallet>();

    const walletsMap = await this.solFrenWallet.getWallets(walletAddresses);
    console.debug("listWallets got size:[%s]", walletsMap.size, walletsMap.keys);
    for (let k of walletsMap.keys()) {
      const v = walletsMap.get(k)!;
      console.debug("k:[$s] v:[$s]", k, v);
      let twitter: Twitter | undefined;
      if (v.twitterInfo) {
        twitter = {
          id: v.twitterInfo.id,
          name: v.twitterInfo.name,
          description: v.twitterInfo.description,
          profileImageUrl: v.twitterInfo.profile_image_url,
          location: v.twitterInfo.location,
          username: v.twitterInfo.username,
          verified: v.twitterInfo.verified,
          publicMetrics: {
            followersCount: v.twitterInfo.public_metrics.followers_count,
            followingCount: v.twitterInfo.public_metrics.following_count,
            tweetCount: v.twitterInfo.public_metrics.tweet_count,
            listedCount: v.twitterInfo.public_metrics.listed_count,
          }
        } as Twitter;
      }

      type SelectedAvatarNFT = {
        name: string;
        imageUrl: string;
      } | undefined
      let selectedAvatarNFT: SelectedAvatarNFT = undefined
      if (v.selectedAvatarNFT) {
        selectedAvatarNFT = {
          name: v.selectedAvatarNFT!.name,
          imageUrl: v.selectedAvatarNFT!.image_url,
        };
      }
      wallets.set(k, {
        address: k,
        name: v.name,
        description: v.description,
        twitterHandle: v.twitterHandle,
        twitter,
        solanaDomain: v.solanaDomain,
        achievements: v.achievements,
        selectedAvatarNFT: selectedAvatarNFT,
        followerCount: await this.solFrenFollow.countFollowers(k, FollowType.Wallet),
        followingCount: await this.solFrenFollow.countFollowings(k, FollowType.Wallet),
        github: undefined, // deprecated
      })
    }

    return wallets;
  }

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

  public async follow(walletAddress: string, followAddress: string) {
    await this.solFrenFollow.follow(walletAddress, followAddress, FollowType.Wallet);
    await this.solFrenFollow.close();
  }

  public async unfollow(walletAddress: string, followAddress: string) {
    await this.solFrenFollow.unfollow(walletAddress, followAddress, FollowType.Wallet);
    await this.solFrenFollow.close();
  }

  public async listFollowers(walletAddress: string, size: number = 30, cursor: string = ''): Promise<ListFollowersResponse> {
    const followers = await this.solFrenFollow.listFollowers(walletAddress, FollowType.Wallet);
    const res: ListFollowersResponse = { followers };

    return res;
  }

  public async listFollowings(walletAddress: string, size: number = 30, cursor: string = ''): Promise<ListFollowingsResponse> {
    const followings = await this.solFrenFollow.listFollowings(walletAddress, FollowType.Wallet);
    const res: ListFollowingsResponse = { followings: followings };

    return res;
  }
}
