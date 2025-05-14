import { CHAIN_IDS } from '@clober/v2-sdk'

export const PYTH_HERMES_ENDPOINT: {
  [chain in CHAIN_IDS]: string
} = {
  [CHAIN_IDS.MONAD_TESTNET]: 'https://hermes-beta.pyth.network',
  [CHAIN_IDS.RISE_SEPOLIA]: 'https://hermes-beta.pyth.network',
}
