import { Client } from '@elastic/elasticsearch';
import { WalletInfo } from './types';

export default class SolFrenWallet {
  private client: Client;

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
        index: 'fe-wallets',
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

  public async createWallet(walletAddress: string) {
    await this.client.create({
      index: 'fe-wallets',
      id: walletAddress,
      document: { 'walletAddress': walletAddress },
    });
  }
}
