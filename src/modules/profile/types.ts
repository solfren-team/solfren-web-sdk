export interface ProfileItem {
  wallet: Wallet
  statistics: Statistics
}

export interface Wallet {
  address: string
  name?: string
  description?: string
  twitterHandle?: string
  twitter?: Twitter
  solanaDomain?: string
  followering?: Array<string>
  followers?: number
  achievements?: Array<string>
  selectedAvatarNFT?: {
    name: string
    imageUrl: string
  }
}

export interface Twitter {
  id: string
  name: string
  description?: string
  profileImageUrl?: string
  location?: string
  username: string
  verified?: boolean
  publicMetrics: {
    followersCount?: number
    followingCount?: number
    tweetCount?: number
    listedCount?: number
  }
}

export interface Statistics {
  volume30DaysSum?: number
  hodlDaysSum?: number
  collectionCount?: number
  nftCount?: number
  trade30DaysCount?: number
}
