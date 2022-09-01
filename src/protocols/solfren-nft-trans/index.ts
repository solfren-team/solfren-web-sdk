import { Client } from '@elastic/elasticsearch';
import { Transaction, TransactionType } from './types';

export default class SolFrenNftTrans {
  private client: Client;
  readonly ES_INDEX = 'sol-nft-trans';
  readonly PIT_KEEP_ALIVE = '1m';

  public constructor(apiKey: String) {
    this.client = new Client({
      node: 'http://es.solfren.xyz:9200',
      auth: {
        apiKey: `${apiKey}`
      }
    });
  }

  /**
   * listTradesByCollection returns nft transactions and cursor.
   * @param id
   * @param size
   * @param cursor
   * @returns [transactions, nextCursor]
   */
  public async listTradesByCollection(id: string, size: number = 30, cursor?: string): Promise<[Transaction[], string]> {
    if (!cursor) {
      const pit = await this.client.openPointInTime({
        index: this.ES_INDEX,
        keep_alive: this.PIT_KEEP_ALIVE,
      });
      cursor = pit.id
    }

    const resp = await this.client.search<Transaction>({
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
}
