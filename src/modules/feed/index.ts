export * from './types';

import { Client } from '@elastic/elasticsearch';
import SolFrenAPI, { SolNFTTransaction, SolNFTTransSale } from '../../protocols/solfren-nft';
import { Action, FeedItem, FeedType } from './types';

export class NFTFeed {
    private client: Client; //TODO: don't access ES from SDK directly, use solfren-api instead.
    private solFrenAPI: SolFrenAPI;

    public constructor(client: Client) {
        this.client = client;
        this.solFrenAPI = new SolFrenAPI(client);
    }

    public async listByFollowing(from: number = 0, size: number = 20, filterByFollowings: string[], withWalletInfo: boolean = true): Promise<FeedItem[]> {
        let feedItems: FeedItem[] = [];
        // get NFT Trading feeds
        const nftTrans = await this.solFrenAPI.getNFTTransactions(from, size, filterByFollowings)
        feedItems = feedItems.concat(this.constructFeedItem(nftTrans, filterByFollowings, withWalletInfo));
        
        //TODO: get Owner Post feeds


        return feedItems;
    }

    public async listByDiscover(from: number = 0, size: number = 20, withWalletInfo: boolean = true): Promise<FeedItem[]> {
        //TODO: recommendation for feed discover
        let feedItems: FeedItem[] = [];
        // get NFT Trading feeds
        const nftTrans = await this.solFrenAPI.getNFTTransactions(from, size, [])
        feedItems = feedItems.concat(this.constructFeedItem(nftTrans, [], withWalletInfo));
        
        //TODO: get Owner Post feeds

        return feedItems;
    }

    private constructFeedItem(nftTrans: SolNFTTransaction[], filterByFollowings: string[], withWalletInfo: boolean = true): FeedItem[] {
        return nftTrans.map((trans) => {
            const tradeAction = filterByFollowings.includes((trans as SolNFTTransSale).ownerAddress) ? Action.Sell : Action.Buy
            let walletInfo = undefined
            if(withWalletInfo) {
                //TODO enrich WalletInfo

            }

            return {
                feedType: FeedType.Trade,
                signature: trans.signature,
                ownerAddress: trans.ownerAddress,
                targetAddress: trans.targetAddress,
                timestamp: trans.timestamp,
            
                nftInfo: trans.nftInfo,
                ownerWalletInfo: walletInfo,
            
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