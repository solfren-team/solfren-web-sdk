import { Github } from "../../protocols/cyberconnect/types"

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
  github?: Github
  solanaDomain?: string
  achievements?: Array<string>
  selectedAvatarNFT?: {
    name: string
    imageUrl: string
  }
  followerCount: number;
  followingCount: number;
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
