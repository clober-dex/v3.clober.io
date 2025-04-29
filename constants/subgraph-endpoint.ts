import { CHAIN_IDS } from '@clober/v2-sdk'

export const FUTURES_SUBGRAPH_ENDPOINT: {
  [chainId in CHAIN_IDS]: string | undefined
} = {
  [CHAIN_IDS.BASE]: undefined,
  [CHAIN_IDS.MONAD_TESTNET]:
    'https://api.goldsky.com/api/public/project_clsljw95chutg01w45cio46j0/subgraphs/clober-futures-subgraph-monad-testnet/latest/gn',
  [CHAIN_IDS.RISE_SEPOLIA]: undefined,
}

export const LIQUIDITY_VAULT_POINT_SUBGRAPH_ENDPOINT: {
  [chainId in CHAIN_IDS]: string | undefined
} = {
  [CHAIN_IDS.BASE]: undefined,
  [CHAIN_IDS.MONAD_TESTNET]:
    'https://api.goldsky.com/api/public/project_clsljw95chutg01w45cio46j0/subgraphs/liquidity-vault-point-monad-testnet/latest/gn',
  [CHAIN_IDS.RISE_SEPOLIA]: undefined,
}

export const ANALYTICS_SUBGRAPH_ENDPOINT: {
  [chainId in CHAIN_IDS]: string | undefined
} = {
  [CHAIN_IDS.BASE]: undefined,
  [CHAIN_IDS.MONAD_TESTNET]:
    'https://api.goldsky.com/api/public/project_clsljw95chutg01w45cio46j0/subgraphs/clober-analytics-subgraph-monad-testnet/latest/gn',
  [CHAIN_IDS.RISE_SEPOLIA]: undefined,
}
