export * from './types';

import { Client, errors } from '@elastic/elasticsearch';
import { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/typesWithBodyKey';
import { SolNFTTransaction, CollectionInfo } from './types';

export default class SolFrenAPI {
  private client: Client;

  private INDEX_COLLECTION = 'sol-collections';
  private INDEX_NFT_TRANS = 'sol-nft-trans';

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
}
