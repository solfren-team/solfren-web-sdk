import { Client } from '@elastic/elasticsearch';
import { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/typesWithBodyKey';
import { SolNFTTransaction } from './types';

export * from './types';

export default class SolFrenAPI {
    private client: Client; //TODO: don't access ES from SDK directly, use solfren-api instead.

    public constructor(client: Client) {
        this.client = client;
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
            index: 'sol-nft-trans',
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
        return resp.hits.hits.map( doc => doc._source!);
    }
}