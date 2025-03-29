import { CHAIN_IDS } from '@clober/v2-sdk'

export const EXPLORER_URL: {
  [chain in number]: string
} = {
  [CHAIN_IDS.BASE]: `https://basescan.org`,
  [CHAIN_IDS.MONAD_TESTNET]: `https://monad-testnet.socialscan.io`,
  [CHAIN_IDS.RISE_SEPOLIA]: `https://explorer.testnet.riselabs.xyz`,
}
