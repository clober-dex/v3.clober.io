import { CHAIN_IDS } from '@clober/v2-sdk'

export const GOOGLE_ANALYTICS_TRACKING_ID: {
  [chainId in CHAIN_IDS]: string | undefined
} = {
  [CHAIN_IDS.BASE]: undefined,
  [CHAIN_IDS.MONAD_TESTNET]: 'G-TE8CSB6JP2',
  [CHAIN_IDS.RISE_SEPOLIA]: 'G-6T0F7T7WC6',
}
