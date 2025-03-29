import { CHAIN_IDS } from '@clober/v2-sdk'
import { zeroHash } from 'viem'

export const VAULT_KEY_INFOS: {
  [chain in CHAIN_IDS]: {
    token0: `0x${string}`
    token1: `0x${string}`
    salt: `0x${string}`
    key: `0x${string}`
    hasDashboard: boolean
    startLPInfo: {
      quoteAmount: number
      baseAmount: number
      lpAmount: number
    }
  }[]
} = {
  [CHAIN_IDS.BASE]: [
    {
      token0: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      token1: '0x4200000000000000000000000000000000000006',
      salt: zeroHash,
      key: '0xc8cbe608c82ee9c4c30f01d7c0eefd977538ac396ed34430aa3993bfe0d363ae',
      hasDashboard: true,
      startLPInfo: {
        quoteAmount: 271.254,
        baseAmount: 0.1,
        lpAmount: 271.254,
      },
    },
  ],
  [CHAIN_IDS.MONAD_TESTNET]: [
    {
      token0: '0x0000000000000000000000000000000000000000',
      token1: '0xf817257fed379853cDe0fa4F97AB987181B1E5Ea',
      salt: zeroHash,
      key: '0xad46920833ad7a1ba8e74cc241faf9ae4fd3dc4616ad9648b13160f8453e444f',
      hasDashboard: false,
      startLPInfo: {
        quoteAmount: 16.2,
        baseAmount: 1,
        lpAmount: 1,
      },
    },
    {
      token0: '0x0EfeD4D9fB7863ccC7bb392847C08dCd00FE9bE2',
      token1: '0xf817257fed379853cDe0fa4F97AB987181B1E5Ea',
      salt: zeroHash,
      key: '0xf3c347e880b6a775f4f69f6db22860636351a70f18857fab2c56dc32835a1627',
      hasDashboard: false,
      startLPInfo: {
        quoteAmount: 10031,
        baseAmount: 10000,
        lpAmount: 10031,
      },
    },
  ],
  [CHAIN_IDS.RISE_SEPOLIA]: [],
}
