import { CHAIN_IDS } from '@clober/v2-sdk'
import { zeroAddress, zeroHash } from 'viem'

export const WHITELISTED_VAULTS: {
  [chain in CHAIN_IDS]: {
    token0: `0x${string}`
    token1: `0x${string}`
    salt: `0x${string}`
    key: `0x${string}`
    hasDashboard: boolean
    hasCloberPoint: boolean
    startLPInfo: {
      quoteAmount: number
      baseAmount: number
      lpAmount: number
      timestamp: number
      priceMultiplier: number
    }
  }[]
} = {
  [CHAIN_IDS.BASE]: [
    {
      // https://basescan.org/tx/0x12dc122f8d1bd78b3f2be55d6e228c9926b4ab0d97bc766bb37e0b7ec8e353ea#eventlog
      token0: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      token1: '0x4200000000000000000000000000000000000006',
      salt: zeroHash,
      key: '0xc8cbe608c82ee9c4c30f01d7c0eefd977538ac396ed34430aa3993bfe0d363ae',
      hasDashboard: true,
      hasCloberPoint: true,
      startLPInfo: {
        quoteAmount: 271.254,
        baseAmount: 0.1,
        lpAmount: 271.254,
        timestamp: 1739260397,
        priceMultiplier: 1,
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
      hasCloberPoint: true,
      startLPInfo: {
        quoteAmount: 405000,
        baseAmount: 25000,
        lpAmount: 405000,
        timestamp: 1742198400,
        priceMultiplier: 1e10,
      },
    },
    {
      token0: '0x0EfeD4D9fB7863ccC7bb392847C08dCd00FE9bE2',
      token1: '0xf817257fed379853cDe0fa4F97AB987181B1E5Ea',
      salt: zeroHash,
      key: '0xf3c347e880b6a775f4f69f6db22860636351a70f18857fab2c56dc32835a1627',
      hasDashboard: false,
      hasCloberPoint: false,
      startLPInfo: {
        quoteAmount: 10031,
        baseAmount: 10000,
        lpAmount: 10031,
        timestamp: 1743062400,
        priceMultiplier: 1e10,
      },
    },
    {
      token0: '0xb2f82D0f38dc453D596Ad40A37799446Cc89274A',
      token1: zeroAddress,
      salt: zeroHash,
      key: '0xebadcf03683413b3fc72a0d16a0a02902db04ee7a3b439de5033e825c1d79380',
      hasDashboard: false,
      hasCloberPoint: false,
      startLPInfo: {
        quoteAmount: 1000,
        baseAmount: 1000,
        lpAmount: 1000,
        timestamp: 1743667318,
        priceMultiplier: 1e10,
      },
    },
  ],
}
