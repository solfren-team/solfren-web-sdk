import { Client, errors } from '@elastic/elasticsearch';
import { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/typesWithBodyKey';
import { SolNFTTransaction, CollectionInfo, SolNFTTransSale, TransactionType, ListCollectionsCursor, ListCollectionsResponse, PIT } from './types';
import moment from 'moment';

export default class SolFrenAPI {
  private client: Client;
  private pits: Map<string, PIT>;

  private INDEX_COLLECTION = 'sol-collections';
  private INDEX_NFT_TRANS = 'sol-nft-trans';
  private PIT_KEEP_ALIVE = 1;

  public constructor(apiKey: String) {
    //TODO: don't access ES from SDK directly, use solfren-api instead.
    this.client = new Client({
      node: 'http://es.solfren.xyz:9200',
      auth: {
        apiKey: `${apiKey}`
      }
    });
    this.pits = new Map<string, PIT>();
  }

  public async getNFTTransactions(from: number = 0, size: number = 20, filterByAddresses: string[], hasCollection?: boolean): Promise<SolNFTTransaction[]> {
    let filterByAddressQuery: QueryDslQueryContainer = (filterByAddresses.length > 0) ? {
      bool: {
        should: [
          {
            bool: {
              filter: {
                terms: {
                  'ownerAddress': filterByAddresses
                }
              }
            }
          },
          {
            bool: {
              filter: {
                terms: {
                  'targetAddress': filterByAddresses
                }
              }
            }
          }
        ]
      }
    } : {
      match_all: {}
    }

    let hasCollectionQuery: QueryDslQueryContainer;
    switch (hasCollection) {
      case true:
        hasCollectionQuery = {
          exists: {
            field: "nftInfo.collectionInfo"
          }
        };
      case false:
        hasCollectionQuery = {
          bool: {
            must_not: {
              exists: {
                field: "nftInfo.collectionInfo"
              }
            }
          }
        };
      default: // undefine
        hasCollectionQuery = {
          match_all: {}
        };
    }

    const resp = await this.client.search<SolNFTTransaction>({
      index: this.INDEX_NFT_TRANS,
      from: from,
      size: size,
      query: {
        bool: {
          must: [
            filterByAddressQuery,
            hasCollectionQuery
          ]
        }
      },
      sort: 'timestamp:desc'
    });
    return resp.hits.hits.map(doc => doc._source!);
  }

  public async getCollection(id: string): Promise<CollectionInfo | null> {
    const resp = await this.client.get<CollectionInfo>({
      index: this.INDEX_COLLECTION,
      id,
    }).catch(err => {
      if (err instanceof errors.ResponseError && (err as errors.ResponseError).statusCode == 404) {
        return null;
      } else {
        throw new Error(`failed to getCollection: ${err}`);
      }
    });
    return resp?._source!;
  }

  /**
   * listTradesByCollection returns nft transactions and cursor.
   * @param id
   * @param size
   * @param cursor
   * @returns [transactions, nextCursor]
   */
  public async listTradesByCollection(id: string, size: number = 30, cursor?: string): Promise<[SolNFTTransSale[], string]> {
    if (!cursor) {
      const pit = await this.client.openPointInTime({
        index: this.INDEX_NFT_TRANS,
        keep_alive: `${this.PIT_KEEP_ALIVE}m`,
      });
      cursor = pit.id
    }

    const resp = await this.client.search<SolNFTTransSale>({
      size,
      pit: {
        id: cursor,
        keep_alive: `${this.PIT_KEEP_ALIVE}m`,
      },
      body: {
        query: {
          bool: {
            must: [
              {
                term: {
                  'nftInfo.collectionInfo.collectionId': id,
                },
              },
              {
                term: {
                  'transType': TransactionType.Trade,
                }
              }
            ],
          }
        }
      }
    });

    return [resp.hits.hits.map(hit => hit._source!), resp.pit_id ?? ""];
  }

  public async listCollections(size: number = 30, cursor?: ListCollectionsCursor): Promise<ListCollectionsResponse> {
    const pit = await this.acquirePIT(this.INDEX_COLLECTION);
    const resp = await this.client.search<CollectionInfo>({
      size,
      pit: {
        id: pit.id,
        keep_alive: `${this.PIT_KEEP_ALIVE}m`,
      },
      body: {
        sort: [
          { '@timestamp': 'desc' },
          { 'collectionId': 'desc' },
        ],
        ...(cursor && { search_after: [(new Date(cursor['@timestamp'])).getTime(), cursor.collectionId] }),
      }
    });

    const collections = resp.hits.hits.map(hit => hit._source!);

    let nextCursor;
    if (collections.length == size) {
      nextCursor = collections[collections.length - 1];
    }

    return {
      collections,
      cursor: nextCursor,
    };
  }

  private async acquirePIT(index: string): Promise<PIT> {
    const pit = this.pits.get(index);
    if (pit && moment().isBefore(pit.expiredAt)) {
      return pit;
    }

    const esPIT = await this.client.openPointInTime({
      index: this.INDEX_COLLECTION,
      keep_alive: `${this.PIT_KEEP_ALIVE}m`,
    });

    // TODO: mutex
    this.pits[index] = esPIT.id;

    return {
      id: esPIT.id,
      expiredAt: moment().add(this.PIT_KEEP_ALIVE, 'm'),
    }
  }
}
