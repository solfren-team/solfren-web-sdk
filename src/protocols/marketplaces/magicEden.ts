import got from 'got';
import { API, CollectionStats } from "./types";

const magicEden: API = {
  endpoint: 'https://api-mainnet.magiceden.dev/v2',
  async getStats(id: string): Promise<CollectionStats | null> {
    try {
      const stats = await got({
        method: 'get',
        url: `${this.endpoint}/collections/${id}/stats`
      }).json<Stats>();

      return {
        floorPrice: stats.floorPrice,
        listedCount: stats.listedCount,
        volumeAll: stats.volumeAll,
      };
    } catch (err) {
      console.error(`failed to getStats: ${err}`);
      return null
    }
  },
};

export default magicEden;

interface Stats {
  symbol: string;
  floorPrice: number;
  listedCount: number;
  volumeAll: number;
}
