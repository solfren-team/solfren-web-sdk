import * as estypes from '@elastic/elasticsearch/lib/api/typesWithBodyKey'
import { WalletInfo } from './modules/wallet'
import { NFTInfo, CollectionInfo } from './protocols/solfren-nft';
import SolFrenWallet from "./modules/wallet";
import { Client } from '@elastic/elasticsearch';
import { NFTFeed } from './modules/feed';
import { Options } from './options';

export default class SolFrenSDK {
    private options: Options;
    private nftFeed?: NFTFeed;

    public constructor(options: Options) {
        this.options = options;
    }

    public getNFTFeed(): NFTFeed {
        if(!this.nftFeed) {
            this.nftFeed = new NFTFeed(this.options);
        }
        return this.nftFeed;
    }
}

export { SolFrenSDK };
