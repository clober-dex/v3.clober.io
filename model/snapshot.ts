export type DailyActivitySnapshot = {
  timestamp: number
  walletCount: number
  transactionCount: number
  volumeSnapshots: {
    symbol: string
    amount: number
    address: `0x${string}`
  }[]
}
