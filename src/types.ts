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
  simpleHash?: {
    key: string
  }
}
