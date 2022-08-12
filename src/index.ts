import { NFTFeed } from './modules/feed';
import Collection from './modules/collection';
import { Options } from './options';

export default class SolFrenSDK {
  private options: Options;

  // modules
  private nftFeed?: NFTFeed;
  private collection?: Collection;

  public constructor(options: Options) {
    this.options = options;
  }

  public getNFTFeed(): NFTFeed {
    if (!this.nftFeed) {
      this.nftFeed = new NFTFeed(this.options);
    }
    return this.nftFeed;
  }

  public getCollection(): Collection {
    if (!this.collection) {
      this.collection = new Collection(this.options);
    }
    return this.collection;
  }
}
