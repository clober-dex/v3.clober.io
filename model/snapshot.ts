// TODO: remove it
export type DailyActivitySnapshot = {
  timestamp: number
  walletCount: number
  newWalletCount: number
  transactionCount: number
  volumeSnapshots: {
    symbol: string
    amount: number
    address: `0x${string}`
  }[]
  transactionTypeSnapshots: {
    type: string
    count: number
  }[]
}
