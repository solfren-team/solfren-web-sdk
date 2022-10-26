export interface Config {
  solFrenAPI?: {
    apiKey: string
    follow: {
      endpoint: string
      username: string
      password: string
    }
  }
  solanaRPC?: {
    endpoint: string
  }
  wonkaAPI?: {
    endpoint: string
  }
  twitter?: {
    apiKey: string
  }
  cyberConnect?: {
    endpoint: string
  }
  simpleHash?: {
    key: string
  }
}
