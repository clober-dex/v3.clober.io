import { CHAIN_IDS } from '@clober/v2-sdk'
import { zeroHash } from 'viem'

import { VaultImmutableInfo } from '../model/vault'

export const WHITELISTED_VAULTS: {
  [chain in CHAIN_IDS]: VaultImmutableInfo[]
} = {
  [CHAIN_IDS.BASE]: [
    {
      // https://basescan.org/tx/0x12dc122f8d1bd78b3f2be55d6e228c9926b4ab0d97bc766bb37e0b7ec8e353ea#eventlog
      currencyA: {
        address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
      },
      currencyB: {
        address: '0x4200000000000000000000000000000000000006',
        name: 'Wrapped Ether',
        symbol: 'WETH',
        decimals: 18,
      },
      salt: zeroHash,
      key: '0xc8cbe608c82ee9c4c30f01d7c0eefd977538ac396ed34430aa3993bfe0d363ae',
      hasDashboard: true,
      hasPoint: true,
      initialLPInfo: {
        quoteTokenAmount: 271.254,
        baseTokenAmount: 0.1,
        lpTokenAmount: 271.254,
        timestamp: 1739260397,
        initialPriceMultiplier: 1,
      },
    },
  ],
  [CHAIN_IDS.MONAD_TESTNET]: [
    {
      currencyA: {
        address: '0xf817257fed379853cDe0fa4F97AB987181B1E5Ea',
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
      },
      currencyB: {
        address: '0x0000000000000000000000000000000000000000',
        name: 'Monad Token',
        symbol: 'MON',
        decimals: 18,
      },
      salt: '0x0000000000000000000000000000000000000000000000000000000000000000',
      key: '0xad46920833ad7a1ba8e74cc241faf9ae4fd3dc4616ad9648b13160f8453e444f',
      hasDashboard: false,
      hasPoint: true,
    },
    {
      currencyA: {
        address: '0xf817257fed379853cDe0fa4F97AB987181B1E5Ea',
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
      },
      currencyB: {
        address: '0x0EfeD4D9fB7863ccC7bb392847C08dCd00FE9bE2',
        name: 'muBOND',
        symbol: 'muBOND',
        decimals: 18,
      },
      salt: '0x0000000000000000000000000000000000000000000000000000000000000000',
      key: '0xf3c347e880b6a775f4f69f6db22860636351a70f18857fab2c56dc32835a1627',
      hasDashboard: false,
      hasPoint: false,
    },
    {
      currencyA: {
        address: '0x0000000000000000000000000000000000000000',
        name: 'Monad Token',
        symbol: 'MON',
        decimals: 18,
      },
      currencyB: {
        address: '0xb2f82D0f38dc453D596Ad40A37799446Cc89274A',
        name: 'aPriori Monad LST',
        symbol: 'aprMON',
        decimals: 18,
      },
      salt: '0x0000000000000000000000000000000000000000000000000000000000000000',
      key: '0xebadcf03683413b3fc72a0d16a0a02902db04ee7a3b439de5033e825c1d79380',
      hasDashboard: false,
      hasPoint: false,
    },
    {
      currencyA: {
        address: '0xf817257fed379853cDe0fa4F97AB987181B1E5Ea',
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
      },
      currencyB: {
        address: '0xF62F63169cA4085Af82C3a147475EFDe3EdD4b50',
        name: 'Hive Stablecoin',
        symbol: 'HIVE',
        decimals: 18,
      },
      salt: '0x0000000000000000000000000000000000000000000000000000000000000000',
      key: '0x2b4a8f6c598547dede3868e214f4f1e972deff1508ad7667d7556264662a5796',
      hasDashboard: false,
      hasPoint: false,
    },
    {
      currencyA: {
        address: '0x0000000000000000000000000000000000000000',
        name: 'Monad Token',
        symbol: 'MON',
        decimals: 18,
      },
      currencyB: {
        address: '0xaEef2f6B429Cb59C9B2D7bB2141ADa993E8571c3',
        name: 'gMON',
        symbol: 'gMON',
        decimals: 18,
      },
      salt: '0x0000000000000000000000000000000000000000000000000000000000000000',
      key: '0xb93510cb90a836b00a33a7452fde41230b3a53fbb804e64737c7cd7533ea14f8',
      hasDashboard: false,
      hasPoint: false,
    },
    {
      currencyA: {
        address: '0x0000000000000000000000000000000000000000',
        name: 'Monad Token',
        symbol: 'MON',
        decimals: 18,
      },
      currencyB: {
        address: '0xe1d2439b75fb9746E7Bc6cB777Ae10AA7f7ef9c5',
        name: 'Kintsu Staked Monad',
        symbol: 'sMON',
        decimals: 18,
      },
      salt: '0x0000000000000000000000000000000000000000000000000000000000000000',
      key: '0x5913968b69d49b992c13c017d99f982eaa0764b6f6c8d6709e6061f7cdbe1d8c',
      hasDashboard: false,
      hasPoint: false,
    },
    {
      currencyA: {
        address: '0x0000000000000000000000000000000000000000',
        name: 'Monad Token',
        symbol: 'MON',
        decimals: 18,
      },
      currencyB: {
        address: '0x3a98250F98Dd388C211206983453837C8365BDc1',
        name: 'ShMonad',
        symbol: 'shMON',
        decimals: 18,
      },
      salt: '0x0000000000000000000000000000000000000000000000000000000000000000',
      key: '0xd1e33fe9673f7b2957cf31bea350b7f99795ee9cfea2392e9a92be6ba32e9a32',
      hasDashboard: false,
      hasPoint: false,
    },

    // futures
    {
      currencyA: {
        address: '0xf817257fed379853cDe0fa4F97AB987181B1E5Ea',
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
      },
      currencyB: {
        address: '0xcaeF04f305313080C2538e585089846017193033',
        name: 'USOILSPOT 2025-05-16',
        symbol: 'USOILSPOT-250516',
        decimals: 18,
      },
      salt: '0x0000000000000000000000000000000000000000000000000000000000000000',
      key: '0x3db3f83f92c322df51252b1052aac7608e4899e59f1db7bb3affaef78ad31e48',
      hasDashboard: false,
      hasPoint: false,
    },
    {
      currencyA: {
        address: '0xf817257fed379853cDe0fa4F97AB987181B1E5Ea',
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
      },
      currencyB: {
        address: '0xCAfFD292a5c578Dbd4BBff733F1553bF2cD8850c',
        name: 'XAU 2025-05-16',
        symbol: 'XAU-250516',
        decimals: 18,
      },
      salt: '0x0000000000000000000000000000000000000000000000000000000000000000',
      key: '0xa45c240e7d5c3420ab0b9ab01b9ea57355bb85062933fd3457b7f0c0ae4af3a3',
      hasDashboard: false,
      hasPoint: false,
    },
    {
      currencyA: {
        address: '0xf817257fed379853cDe0fa4F97AB987181B1E5Ea',
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
      },
      currencyB: {
        address: '0x746e48E2CDD8F6D0B672adAc7810f55658dC801b',
        name: 'EUR 2025-05-16',
        symbol: 'EUR-250516',
        decimals: 18,
      },
      salt: '0x0000000000000000000000000000000000000000000000000000000000000000',
      key: '0xd1599da6214283b747ef71d0c3dd2022d726d98b7029f6d538848ac509eb7878',
      hasDashboard: false,
      hasPoint: false,
    },
    {
      currencyA: {
        address: '0xf817257fed379853cDe0fa4F97AB987181B1E5Ea',
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
      },
      currencyB: {
        address: '0x5F433CFeB6CB2743481a096a56007a175E12ae23',
        name: 'BTC 2025-05-16',
        symbol: 'BTC-250516',
        decimals: 18,
      },
      salt: '0x0000000000000000000000000000000000000000000000000000000000000000',
      key: '0x6f6b49ee7d514d6866eb6528adcb6a57841f87caf8e029839b31bc451cc64c02',
      hasDashboard: false,
      hasPoint: false,
    },
    {
      currencyA: {
        address: '0xf817257fed379853cDe0fa4F97AB987181B1E5Ea',
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
      },
      currencyB: {
        address: '0x53E2BB2d88DdC44CC395a0CbCDDC837AeF44116D',
        name: 'AAPL 2025-05-16',
        symbol: 'AAPL-250516',
        decimals: 18,
      },
      salt: '0x0000000000000000000000000000000000000000000000000000000000000000',
      key: '0xa1e4a63a660c5b0e647d9410b8fbef18bb95adc235bd7297b3f2be8e0c107294',
      hasDashboard: false,
      hasPoint: false,
    },
    {
      currencyA: {
        address: '0xf817257fed379853cDe0fa4F97AB987181B1E5Ea',
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
      },
      currencyB: {
        address: '0xd57e27D90e04eAE2EEcBc63BA28E433098F72855',
        name: 'GOOGL 2025-05-16',
        symbol: 'GOOGL-250516',
        decimals: 18,
      },
      salt: '0x0000000000000000000000000000000000000000000000000000000000000000',
      key: '0x0d27d4c5841b5ad705698709bef0d6a891ccefa0731d60048280195d66e61bac',
      hasDashboard: false,
      hasPoint: false,
    },
    {
      currencyA: {
        address: '0xf817257fed379853cDe0fa4F97AB987181B1E5Ea',
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
      },
      currencyB: {
        address: '0xDB1Aa7232c2fF7bb480823af254453570d0E4A16',
        name: 'TSLA 2025-05-16',
        symbol: 'TSLA-250516',
        decimals: 18,
      },
      salt: '0x0000000000000000000000000000000000000000000000000000000000000000',
      key: '0x4a2e3a99de223d7caa8dccd007ede11bfeb4562a002fe2a700c5f3f6bd5753fb',
      hasDashboard: false,
      hasPoint: false,
    },
    {
      currencyA: {
        address: '0xf817257fed379853cDe0fa4F97AB987181B1E5Ea',
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
      },
      currencyB: {
        address: '0x24A08695F06A37C8882CD1588442eC40061e597B',
        name: 'BRK-A 2025-05-16',
        symbol: 'BRK-A-250516',
        decimals: 18,
      },
      salt: '0x0000000000000000000000000000000000000000000000000000000000000000',
      key: '0xc72b2145027dc9a9ac57f1e3d7e6c8bd5aa07bd3c622cf65b61edbd90ffc45d4',
      hasDashboard: false,
      hasPoint: false,
    },
    {
      currencyA: {
        address: '0xf817257fed379853cDe0fa4F97AB987181B1E5Ea',
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
      },
      currencyB: {
        address: '0x41DF9f8a0c014a0ce398A3F2D1af3164ff0F492A',
        name: 'US30Y 2025-05-16',
        symbol: 'US30Y-250516',
        decimals: 18,
      },
      salt: '0x0000000000000000000000000000000000000000000000000000000000000000',
      key: '0x41d76a57de6d5b77eae21428db3474981b1a4ef4583b4952fd137827f0e887bd',
      hasDashboard: false,
      hasPoint: false,
    },
  ],
  [CHAIN_IDS.RISE_SEPOLIA]: [
    {
      currencyA: {
        address: '0xA985e387dDF21b87c1Fe8A0025D827674040221E',
        name: 'Clober USD',
        symbol: 'cUSD',
        decimals: 6,
      },
      currencyB: {
        address: '0x0000000000000000000000000000000000000000',
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
      },
      salt: '0x0000000000000000000000000000000000000000000000000000000000000000',
      key: '0xecfa2b2198c01967ff83c8401accb26747316b862a74aab6e9c2d914c1da6ab1',
      hasDashboard: false,
      hasPoint: false,
    },
  ],
}
