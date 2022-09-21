export type FollowingCount = {
  followerCount: number;
  followingCount: number;
};

export type Identity = {
  followerCount: number;
  followingCount: number;
  twitter: Twitter;
  github: Github;
};

export type Twitter = {
  handle: string;
  avatar: string;
  verified: boolean;
  tweetId: number;
  source: string;
  followerCount: number;
}

export type Github = {
  username: string;
  gistId: string;
  userId: number;
}
