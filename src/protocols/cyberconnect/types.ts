export type Identity = {
  followerCount: number;
  followingCount: number;

  followers: SocialConnectionsPaginated;
  followings: SocialConnectionsPaginated;
};

export type SocialConnectionsPaginated = {
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string;
    endCursor: string;
  };
  list: SocialConnection[];
};

export type SocialConnection = {
  address: string;
  alias: string;
  avatar: string;
  domain: string;
  ens: string;
};
