export * from './types';

import { Client } from '@elastic/elasticsearch';
import SolFrenAPI, { SolNFTTransaction, SolNFTTransSale } from '../../protocols/solfren-nft';
import SolFrenWallet from '../../protocols/solfren-wallet';
import { Wallet } from '../profile/types'
import { Action, FeedItem, FeedType } from './types';
import { Options } from '../../options';
import { WalletInfo } from '../../protocols/solfren-wallet/types';

export class NFTFeed {
    private solFrenAPI: SolFrenAPI;
    private solFrenWallet: SolFrenWallet;

    public constructor(options: Options) {
        if(options.solFrenAPI == undefined) {
            throw new Error('NFTFeed: must provide SolFrenAPI.apiKey');
        }
        this.solFrenAPI = new SolFrenAPI(options.solFrenAPI.apiKey);
        this.solFrenWallet = new SolFrenWallet(options.solFrenAPI.apiKey);
    }

    public async listByFollowing(from: number = 0, size: number = 20, filterByFollowings: string[], withWalletInfo: boolean = true): Promise<FeedItem[]> {
        let feedItems: FeedItem[] = [];
        // get NFT Trading feeds
        const nftTrans = await this.solFrenAPI.getNFTTransactions(from, size, filterByFollowings)
        feedItems = feedItems.concat(await this.constructFeedItem(nftTrans, filterByFollowings, withWalletInfo));

        //TODO: get Owner Post feeds

        return feedItems;
    }

    public async listByDiscover(from: number = 0, size: number = 20, withWalletInfo: boolean = true): Promise<FeedItem[]> {
        //TODO: recommendation for feed discover
        let feedItems: FeedItem[] = [];
        // get NFT Trading feeds
        const nftTrans = await this.solFrenAPI.getNFTTransactions(from, size, [])
        feedItems = feedItems.concat(await this.constructFeedItem(nftTrans, [], withWalletInfo));

        //TODO: get Owner Post feeds

        return feedItems;
    }

    private async constructFeedItem(nftTrans: SolNFTTransaction[], filterByFollowings: string[], withWalletInfo: boolean = true): Promise<FeedItem[]> {
        let ownerMap = new Map<String, WalletInfo>();
        if (withWalletInfo) {
            // get WalletInfo map
            const ownerAddresses = Array.from(new Set(nftTrans.map( (trans) => trans.ownerAddress)));
            ownerMap = await this.solFrenWallet.getWallets(ownerAddresses);
        }
        return nftTrans.map((trans) => {
            const tradeAction = filterByFollowings.includes((trans as SolNFTTransSale).ownerAddress) ? Action.Sell : Action.Buy

            return {
                feedType: FeedType.Trade,
                signature: trans.signature,
                ownerAddress: trans.ownerAddress,
                targetAddress: trans.targetAddress,
                timestamp: trans.timestamp,

                nftInfo: trans.nftInfo,
                ownerWalletInfo: ownerMap.get(trans.ownerAddress),

                // for Trade Item
                marketplace: (trans as SolNFTTransSale).marketplace,
                candyMachineId: (trans as SolNFTTransSale).candyMachineId,
                price: (trans as SolNFTTransSale).price,
                action: tradeAction,

            } as FeedItem
        });
    }
}

export default NFTFeed;