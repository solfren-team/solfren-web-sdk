import SolFrenAPI from "../../protocols/solfren-nft";
import { CollectionResource } from "./types";
import { Options } from '../../options';

export default class Collection {
  private solFrenAPI: SolFrenAPI;

  public constructor(options: Options) {
    if (options.solFrenAPI == undefined) {
      throw new Error('Collection: must provide SolFrenAPI.apiKey');
    }
    this.solFrenAPI = new SolFrenAPI(options.solFrenAPI.apiKey);
  }

  public async get(id: string): Promise<CollectionResource | null> {
    const collection = await this.solFrenAPI.getCollection(id);
    if (collection) {
      // TODO(jaychung): fill `floorPrice`, `listedCount`, `avgPrice24hr` and `volumeAll`
      return {
        id,
        name: collection?.name ?? '',
        symbol: collection?.symbol ?? '',
        description: collection?.description ?? '',
        image: collection?.image ?? '',
        website: collection?.website ?? '',
        discord: collection?.discord ?? '',
        twitter: collection?.twitter ?? '',
        categories: collection?.categories,
        createdAt: new Date(collection?.createdAt ?? ''),
      }
    }
    return null;
  }
}
