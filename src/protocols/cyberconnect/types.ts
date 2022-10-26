export type Identity = {
  followerCount: number;
  followingCount: number;
  twitter: Twitter;
  github: Github;
  followers: Followers;
  followings: Followings;
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

export type Followers = {
  pageInfo: pageInfo;
  list: List[];
}

export type Followings = {
  pageInfo: pageInfo;
  list: List[];
}

export type pageInfo = {
  startCursor: string;
  endCursor: string;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export type List = {
  address: string;
  domain: string;
  avatar: string;
  namespace: string;
  lastModifiedTime: string;
}
