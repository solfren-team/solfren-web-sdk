import { NFTFeed } from './modules/feed';
import Collection from './modules/nft';
import { Config } from './types';

export default class SolFrenSDK {
  private config: Config;

  // modules
  private nftFeed?: NFTFeed;
  private collection?: Collection;

  public constructor(config: Config) {
    this.config = config;
  }

  public getNFTFeed(): NFTFeed {
    if (!this.nftFeed) {
      this.nftFeed = new NFTFeed(this.config);
    }
    return this.nftFeed;
  }

  public getCollection(): Collection {
    if (!this.collection) {
      this.collection = new Collection(this.config);
    }
    return this.collection;
  }
}
