import { NFTFeed } from './modules/feed';
import NFT from './modules/nft';
import Profile from './modules/profile';
import { Config } from './types';

export default class SolFrenSDK {
  private config: Config;

  // modules
  private nftFeed?: NFTFeed;
  private nft?: NFT;
  private profile?: Profile;

  public constructor(config: Config) {
    this.config = config;
  }

  public getNFTFeed(): NFTFeed {
    if (!this.nftFeed) {
      this.nftFeed = new NFTFeed(this.config);
    }
    return this.nftFeed;
  }

  public getNFT(): NFT {
    if (!this.nft) {
      this.nft = new NFT(this.config);
    }
    return this.nft;
  }

  public getProfile(): Profile {
    if (!this.profile) {
      this.profile = new Profile(this.config);
    }
    return this.profile;
  }
}
