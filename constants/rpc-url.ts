import { CHAIN_IDS } from '@clober/v2-sdk'

export const RPC_URL: {
  [chain in CHAIN_IDS]: string
} = {
  [CHAIN_IDS.BASE]:
    'https://base-mainnet.g.alchemy.com/v2/3Um4IcT1mrq2MEOYurXvsRAzk_v3Q_4X',
  [CHAIN_IDS.MONAD_TESTNET]:
    'https://monad-testnet.blockpi.network/v1/rpc/f58e2c25e2e1239627d95af2fbaf1130d123c0a3',
  [CHAIN_IDS.RISE_SEPOLIA]: 'https://testnet.riselabs.xyz',
}
