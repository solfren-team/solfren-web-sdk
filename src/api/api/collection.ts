import { Client } from '@elastic/elasticsearch';
import { CollectionResource } from '../types';

export default class Collection {
  private esClient: Client;
  private index: string;

  public constructor(esClient: Client) {
    this.esClient = esClient;
    this.index = 'sol-collections';
  }

  public async get(id: string): Promise<CollectionResource | null> {
    const resp = await this.esClient.get<EsCollection>({ index: this.index, id });
    if (resp) {
      const source = resp._source
      // TODO: fill `floorPrice`, `listedCount`, `avgPrice24hr` and `volumeAll`
      return {
        id,
        name: source?.name ?? '',
        symbol: source?.symbol ?? '',
        description: source?.description ?? '',
        image: source?.image ?? '',
        website: source?.website ?? '',
        discord: source?.discord ?? '',
        twitter: source?.twitter ?? '',
        categories: source?.categories,
        createdAt: new Date(source?.createdAt ?? ''),
      }
    }
    return null;
  }
}

// please refer to https://github.com/solfren-team/nft-fetcher/blob/main/src/lib/marketplaces/types.ts#L84
interface EsCollection {
  collectionId: string; // uid gen by SolFren, from 1. Collection.key or 2. CandyMachineId
  collectionKey?: string;
  candyMachineId?: string;
  symbol: string;
  name: string;
  description?: string;
  image?: string;
  createdAt?: Date;
  website?: string;
  discord?: string;
  twitter?: string;
  categories?: string[];
  totalItems?: number;
  parentCollectionId?: string; // prepare for nested collections (metaplex v1.3)
}
