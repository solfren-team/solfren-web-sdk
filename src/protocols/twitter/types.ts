export interface TwitterInfo {
  name: string,
  description?: string,
  profile_image_url?: string,
  id: string,
  location?: string,
  username: string,
  verified?: boolean,
  public_metrics: {
    followers_count?: number,
    following_count?: number,
    tweet_count?: number,
    listed_count?: number
  }
}
