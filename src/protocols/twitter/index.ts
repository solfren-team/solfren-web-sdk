import { Client } from 'twitter-api-sdk';
import { TwitterInfo } from './types';

export default class TwitterAPI {
  private client: Client;

  public constructor(apiKey: string) {
    this.client = new Client(apiKey);
  }

  public async getTwitterInfo(twitterHandle: string): Promise<TwitterInfo | undefined> {
    const username = twitterHandle.startsWith('@') ? twitterHandle.substring(1) : twitterHandle;
    const { data } = await this.client.users.findUserByUsername(username);
    if (!data) {
      console.error('failed to findUserByUsername twitter:[%s]', twitterHandle);
      return undefined;
    }

    return {
      id: data.id,
      name: data.name,
      username: data.username,
      description: data.description,
      profile_image_url: data.profile_image_url,
      verified: data.verified,
      location: data.location,
      public_metrics: {
        followers_count: data.public_metrics?.followers_count ?? undefined,
        following_count: data.public_metrics?.following_count ?? undefined,
        tweet_count: data.public_metrics?.tweet_count ?? undefined,
        listed_count: data.public_metrics?.listed_count ?? undefined,
      },
    } as TwitterInfo;
  }
}
