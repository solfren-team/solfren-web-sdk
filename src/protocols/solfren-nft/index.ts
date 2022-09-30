import { Client, errors } from '@elastic/elasticsearch';
import { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/typesWithBodyKey';
import { SolNFTTransaction, CollectionInfo, SolNFTTransSale, TransactionType, CollectionComment } from './types';

export default class SolFrenAPI {
  private client: Client;

  private INDEX_COLLECTION = 'sol-collections';
  private INDEX_NFT_TRANS = 'sol-nft-trans';
  private PIT_KEEP_ALIVE = '1m';

  public constructor(apiKey: String) {
    //TODO: don't access ES from SDK directly, use solfren-api instead.
    this.client = new Client({
      node: 'http://es.solfren.xyz:9200',
      auth: {
        apiKey: `${apiKey}`
      }
    });
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
    }).catch(ex => {
      if (
        ex instanceof errors.ResponseError &&
        (ex as errors.ResponseError).statusCode == 404
      ) {
        return null;
      } else {
        throw ex;
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
        keep_alive: this.PIT_KEEP_ALIVE,
      });
      cursor = pit.id
    }

    const resp = await this.client.search<SolNFTTransSale>({
      size,
      pit: {
        id: cursor,
        keep_alive: this.PIT_KEEP_ALIVE,
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

  public async createCollectionComment(id: string, author: string, content: string): Promise<CollectionComment> {
    const resp = await this.client.search({
      index: this.INDEX_COLLECTION,
      size: 1
    });
    console.log(resp.hits.hits);

    const comment: CollectionComment = {
      author,
      content,
      createdAt: new Date(),
    }

    await this.client.update({
      index: this.INDEX_COLLECTION,
      id,
      script: {
        source: 'ctx._source.comments.add(params.comment)',
        params: { comment },
      },
    });

    return comment;
  }

  public async listCollectionComments(id: string, size: number = 30): Promise<CollectionComment[]> {
    const resp = await this.client.get<CollectionComment[]>({
      index: this.INDEX_COLLECTION,
      id,
      _source: ['comments'],
    }).catch(err => {
      if (
        err instanceof errors.ResponseError &&
        (err as errors.ResponseError).statusCode == 404
      ) {
        return null;
      } else {
        throw err;
      }
    });

    return resp?._source ?? [];
  }
}
