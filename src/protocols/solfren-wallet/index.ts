import { Client } from '@elastic/elasticsearch';
import { WalletInfo } from './types';
import * as estypes from '@elastic/elasticsearch/lib/api/typesWithBodyKey'

export default class SolFrenWallet {
  private client: Client;
  readonly INDEX_WALLET_INFOS = 'fe-wallets';

  public constructor(apiKey: String) {
    //TODO: don't access ES from SDK directly, use solfren-api instead.
    this.client = new Client({
      node: 'http://es.solfren.xyz:9200',
      auth: {
        apiKey: `${apiKey}`
      }
    });
  }

  public async getWallet(walletAddress: string): Promise<WalletInfo> {
    try {
      const resp = await this.client.get<WalletInfo>({
        index: this.INDEX_WALLET_INFOS,
        id: walletAddress,
      });

      return resp._source as WalletInfo;
    } catch (err: any) {
      // try to fill up wallet info
      await this.createWallet(walletAddress);

      return {
        walletAddress,
        name: '',
        followering: [],
        twitterHandle: '',
      } as WalletInfo;
    }
  }

  public async getWallets(walletAddresses: string[]): Promise<Map<string,WalletInfo>> {
    const resp = await this.client.mget<WalletInfo>({
      index: this.INDEX_WALLET_INFOS,
      ids: walletAddresses,
    });
    const walletInfos = new Map<string,WalletInfo>();
    for (const i in resp.docs) {
        const walletInfo = (resp.docs[i] as estypes.GetGetResult<WalletInfo>)._source;
        if(walletInfo){

            //先不 sync bonfida, 太慢了，進 profile 時才 sync
            // walletInfo = await this.syncBonfidaData(walletInfo);
            walletInfos.set(resp.docs[i]._id, walletInfo)
        }
    }
    return walletInfos;
  }

  public async createWallet(walletAddress: string) {
    await this.client.create({
      index: 'fe-wallets',
      id: walletAddress,
      document: { 'walletAddress': walletAddress },
    });
  }
}
