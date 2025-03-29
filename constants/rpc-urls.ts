import { CHAIN_IDS } from '@clober/v2-sdk'

export const RPC_URL: {
  [chain in number]: string
} = {
  [CHAIN_IDS.BASE]:
    'https://base.blockpi.network/v1/rpc/d19f249ccf70c63f55e6fcddf5903edfc7b8df32',
  [CHAIN_IDS.MONAD_TESTNET]:
    'https://monad-testnet.blockpi.network/v1/rpc/f58e2c25e2e1239627d95af2fbaf1130d123c0a3',
  [CHAIN_IDS.RISE_SEPOLIA]: 'https://testnet.riselabs.xyz',
}
