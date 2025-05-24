export type Currency = {
  address: `0x${string}`
  name: string
  symbol: string
  decimals: number
  icon?: string
  isVerified?: boolean
}

export type LpCurrency = Currency & {
  currencyA?: Currency
  currencyB?: Currency
}
