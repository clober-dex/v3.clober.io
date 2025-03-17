import { CHAIN_IDS } from '@clober/v2-sdk'
import { zeroHash } from 'viem'

export const START_LP_INFO: {
  [chain in CHAIN_IDS]: {
    quoteAmount: number
    baseAmount: number
    lpAmount: number
  } | null
} = {
  [CHAIN_IDS.BASE]: {
    quoteAmount: 271.254,
    baseAmount: 0.1,
    lpAmount: 271.254,
  },
  [CHAIN_IDS.MONAD_TESTNET]: {
    quoteAmount: 16.2,
    baseAmount: 1,
    lpAmount: 1,
  },
}

export const VAULT_KEY_INFOS: {
  [chain in CHAIN_IDS]: {
    token0: `0x${string}`
    token1: `0x${string}`
    salt: `0x${string}`
    key: `0x${string}`
  }[]
} = {
  [CHAIN_IDS.BASE]: [
    {
      token0: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      token1: '0x4200000000000000000000000000000000000006',
      salt: zeroHash,
      key: '0xc8cbe608c82ee9c4c30f01d7c0eefd977538ac396ed34430aa3993bfe0d363ae',
    },
  ],
  [CHAIN_IDS.MONAD_TESTNET]: [
    {
      token0: '0x0000000000000000000000000000000000000000',
      token1: '0xf817257fed379853cDe0fa4F97AB987181B1E5Ea',
      salt: zeroHash,
      key: '0xad46920833ad7a1ba8e74cc241faf9ae4fd3dc4616ad9648b13160f8453e444f',
    },
  ],
}
