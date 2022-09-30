import { Client } from '@elastic/elasticsearch';
import * as estypes from '@elastic/elasticsearch/lib/api/typesWithBodyKey'
import { TopDiversityItem, TopTradingFreqItem, TopVolumeItem, WalletInfo } from './types';

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
      console.log("failed to getWallet addr:[$s]", walletAddress, err);
      await this.createWallet(walletAddress);

      return {
        walletAddress,
        name: '',
        followering: [],
        twitterHandle: '',
      } as WalletInfo;
    }
  }

  public async getWallets(walletAddresses: string[]): Promise<Map<string, WalletInfo>> {
    const walletInfos = new Map<string, WalletInfo>();
    // bypass empty query
    if(walletAddresses.length == 0) {
      return walletInfos;
    }
    const resp = await this.client.mget<WalletInfo>({
      index: this.INDEX_WALLET_INFOS,
      ids: walletAddresses,
    });
    for (const i in resp.docs) {
      const walletInfo = (resp.docs[i] as estypes.GetGetResult<WalletInfo>)._source;
      if (walletInfo) {

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

  public async upsertWallet(walletInfo: WalletInfo) {
    return await this.client.update({
      index: 'fe-wallets',
      id: walletInfo.walletAddress,
      doc: walletInfo,
      doc_as_upsert: true
    })
  }

  public async getTopVolume(walletAddress: string): Promise<TopVolumeItem | undefined> {
    const resp = await this.client.search({
      index: 'sol-nft-trans',
      size: 0,
      q: `@timestamp:[now/d-30d TO now/d+1d] AND ownerAddress:${walletAddress}`,
      aggs: {
        owner: {
          terms: {
            field: 'ownerAddress',
            size: 1,
            order: {
              'sumPrice': 'desc',
            },
          },
          aggs: {
            'top': {
              top_hits: {
                size: 5,
                sort: [
                  {
                    'price': 'desc',
                  },
                ],
              },
            },
            'sumPrice': {
              sum: {
                field: 'price',
              },
            },
            'avgPrice': {
              avg: {
                field: 'price',
              },
            },
            'maxPrice': {
              max: {
                field: 'price',
              },
            },
            'minPrice': {
              min: {
                field: 'price',
              },
            },
          },
        },
      },
    });

    if (!resp.aggregations || resp.aggregations['owner']['buckets'].length === 0) {
      return undefined;
    }
    const bucket = resp.aggregations['owner']['buckets'][0];

    return {
      ownerAddress: bucket.key,
      count: bucket.doc_count,
      sum: bucket.sumPrice.value,
      avg: bucket.avgPrice.value,
      max: bucket.maxPrice.value,
      topHits: bucket.top.hits.hits.map((i: any) => i._source),
    } as TopVolumeItem;
  }

  public async getTopDiversity(walletAddress: string): Promise<TopDiversityItem | undefined> {
    const resp = await this.client.search({
      index: 'sol-nft-trans',
      size: 0,
      q: `owner_address:${walletAddress}`,
      aggs: {
        owner: {
          terms: {
            field: 'ownerAddress',
            size: 1,
            order: {
              'collectionCount': 'desc',
            },
          },
          aggs: {
            'top': {
              top_hits: {
                size: 5,
              },
            },
            'collectionCount': {
              cardinality: {
                field: 'nftInfo.collectionInfo.collectionId',
                precision_threshold: 100,
              },
            },
          },
        },
      },
    });

    if (!resp.aggregations || resp.aggregations['owner']['buckets'].length === 0) {
      return undefined;
    }
    const bucket = resp.aggregations['owner']['buckets'][0];

    return {
      ownerAddress: bucket.key,
      nftCount: bucket.doc_count,
      collectionCount: bucket.collectionCount.value,
      topHits: bucket.top.hits.hits.map((i: any) => i._source),
    } as TopDiversityItem;
  }

  public async getTopTradingFreq(walletAddress: string): Promise<TopTradingFreqItem | undefined> {
    const resp = await this.client.search({
      index: 'sol-nft-trans',
      size: 0,
      query: {
        bool: {
          minimum_should_match: 1,
          should: [
            {
              bool: {
                filter: {
                  term: { targetAddress: walletAddress },
                },
              },
            },
            {
              bool: {
                filter: {
                  term: { ownerAddress: walletAddress },
                },
              },
            },
          ],
          filter: [
            {
              range: {
                'timestamp': {
                  gte: 'now/d-30d',
                  lt: 'now/d+1d',
                },
              },
            },
          ],
        },
      },
      aggs: {
        'buy': {
          filter: {
            term: {
              'targetAddress': walletAddress,
            },
          },
        },
        'sell': {
          filter: {
            term: {
              'ownerAddress': walletAddress,
            },
          },
        },
        'collection': {
          terms: {
            field: 'nftInfo.collectionInfo.collectionId',
            size: 5,
          },
          aggs: {
            'top': {
              top_hits: {
                size: 1,
              },
            },
          },
        },
      },
    });

    if (!resp.aggregations) {
      return undefined;
    }
    const aggs: any = resp.aggregations;

    return {
      ownerAddress: walletAddress,
      count: aggs.sell.doc_count + aggs.buy.doc_count,
      sellCount: aggs.sell.doc_count,
      buyCount: aggs.buy.doc_count,
      collections: aggs.collection.buckets.map((col: any) => {
        return {
          collectionName: col.name,
          collectionImage: col.image,
          count: col.doc_count,
          topHit: col.top.hits.hits[0]._source,
        };
      }),
    } as TopTradingFreqItem;
  }
}
