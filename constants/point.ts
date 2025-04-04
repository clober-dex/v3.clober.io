import { CHAIN_IDS } from '@clober/v2-sdk'

export const LIQUIDITY_VAULT_POINT_SUBGRAPH_ENDPOINT: {
  [chainId in CHAIN_IDS]: string | undefined
} = {
  [CHAIN_IDS.BASE]:
    'https://subgraph.satsuma-prod.com/f6a8c4889b7b/clober/liquidity-vault-point-base/api',
  [CHAIN_IDS.MONAD_TESTNET]:
    'https://api.goldsky.com/api/public/project_clsljw95chutg01w45cio46j0/subgraphs/liquidity-vault-point-monad-testnet/v1.0.0/gn',
}

export const LIQUIDITY_VAULT_POINT_START_AT: {
  [chainId in CHAIN_IDS]:
    | {
        [key in string]: number
      }
    | undefined
} = {
  [CHAIN_IDS.BASE]: {
    ['0xc8cbe608c82ee9c4c30f01d7c0eefd977538ac396ed34430aa3993bfe0d363ae']: 1743465600,
  },
  [CHAIN_IDS.MONAD_TESTNET]: {
    ['0xad46920833ad7a1ba8e74cc241faf9ae4fd3dc4616ad9648b13160f8453e444f']: 1743465600,
  },
}

export const LIQUIDITY_VAULT_POINT_PER_SECOND: {
  [chainId in CHAIN_IDS]:
    | {
        [key in string]: number
      }
    | undefined
} = {
  [CHAIN_IDS.BASE]: {
    ['0xc8cbe608c82ee9c4c30f01d7c0eefd977538ac396ed34430aa3993bfe0d363ae']: 0.000001,
  },
  [CHAIN_IDS.MONAD_TESTNET]: {
    ['0xad46920833ad7a1ba8e74cc241faf9ae4fd3dc4616ad9648b13160f8453e444f']: 0.000001,
  },
}
