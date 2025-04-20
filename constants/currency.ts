import { zeroAddress } from 'viem'
import { CHAIN_IDS } from '@clober/v2-sdk'

import { Currency } from '../model/currency'

export const PRICE_FEED_ID_LIST: {
  [chain in CHAIN_IDS]: {
    priceFeedId: `0x${string}`
    address: `0x${string}`
  }[]
} = {
  [CHAIN_IDS.BASE]: [],
  [CHAIN_IDS.MONAD_TESTNET]: [
    {
      address: '0x836047a99e11f376522b447bffb6e3495dd0637c', // oWETH
      priceFeedId:
        '0xca80ba6dc32e08d06f1aa886011eed1d77c77be9eb761cc10d72b7d0a2fd57a6',
    },
    {
      address: '0xA296f47E8Ff895Ed7A092b4a9498bb13C46ac768', // wWETH
      priceFeedId:
        '0xca80ba6dc32e08d06f1aa886011eed1d77c77be9eb761cc10d72b7d0a2fd57a6',
    },
    {
      address: '0xB5a30b0FDc5EA94A52fDc42e3E9760Cb8449Fb37', // WETH
      priceFeedId:
        '0xca80ba6dc32e08d06f1aa886011eed1d77c77be9eb761cc10d72b7d0a2fd57a6',
    },
    {
      address: '0x88b8E2161DEDC77EF4ab7585569D2415a1C1055D', // USDT
      priceFeedId:
        '0x1fc18861232290221461220bd4e2acd1dcdfbc89c84092c93c18bdc7756c1588',
    },
    // futures
    {
      address: '0x1D074e003E222905e31476A8398e36027141915b', // MON-TGE
      priceFeedId:
        '0xe786153cc54abd4b0e53b4c246d54d9f8eb3f3b5a34d4fc5a2e9a423b0ba5d6b',
    },
    {
      address: '0xcaeF04f305313080C2538e585089846017193033', // USOILSPOT
      priceFeedId:
        '0x24d84a7ab973231e4394015ece17a2155174123be2f8e38c751e17fbd2fcedad',
    },
    {
      address: '0xCAfFD292a5c578Dbd4BBff733F1553bF2cD8850c', // XAU
      priceFeedId:
        '0x30a19158f5a54c0adf8fb7560627343f22a1bc852b89d56be1accdc5dbf96d0e',
    },
    {
      address: '0x746e48E2CDD8F6D0B672adAc7810f55658dC801b', // EUR
      priceFeedId:
        '0xc1b12769f6633798d45adfd62bfc70114839232e2949b01fb3d3f927d2606154',
    },
    {
      address: '0x5F433CFeB6CB2743481a096a56007a175E12ae23', // BTC
      priceFeedId:
        '0xf9c0172ba10dfa4d19088d94f5bf61d3b54d5bd7483a322a982e1373ee8ea31b',
    },
    {
      address: '0x53E2BB2d88DdC44CC395a0CbCDDC837AeF44116D', // AAPL
      priceFeedId:
        '0xafcc9a5bb5eefd55e12b6f0b4c8e6bccf72b785134ee232a5d175afd082e8832',
    },
    {
      address: '0xd57e27D90e04eAE2EEcBc63BA28E433098F72855', // GOOGL
      priceFeedId:
        '0x545b468a0fc88307cf64f7cda62b190363089527f4b597887be5611b6cefe4f1',
    },
    {
      address: '0xDB1Aa7232c2fF7bb480823af254453570d0E4A16', // TSLA
      priceFeedId:
        '0x7dac7cafc583cc4e1ce5c6772c444b8cd7addeecd5bedb341dfa037c770ae71e',
    },
    {
      address: '0x24A08695F06A37C8882CD1588442eC40061e597B', // BRK-A
      priceFeedId:
        '0xb3eaa2aef31b2999827f2183b5dded7553bf036cc927f1d60cf824f5ea1d428a',
    },
    {
      address: '0x41DF9f8a0c014a0ce398A3F2D1af3164ff0F492A', // US30Y
      priceFeedId:
        '0xf3030274adc132e3a31d43dd7f56ac82ae9d673aa0c15a0ce15455a9d00434e6',
    },
    //
    {
      address: '0xf817257fed379853cDe0fa4F97AB987181B1E5Ea', // USDC
      priceFeedId:
        '0x41f3625971ca2ed2263e78573fe5ce23e13d2558ed3f2e47ab0f84fb9e7ae722',
    },
    {
      address: '0xF62F63169cA4085Af82C3a147475EFDe3EdD4b50', // HIVE
      priceFeedId:
        '0x41f3625971ca2ed2263e78573fe5ce23e13d2558ed3f2e47ab0f84fb9e7ae722',
    },
    {
      address: '0x43D614B1bA4bA469fAEAa4557AEAFdec039b8795', // MOCKB
      priceFeedId:
        '0x41f3625971ca2ed2263e78573fe5ce23e13d2558ed3f2e47ab0f84fb9e7ae722',
    },
  ],
  [CHAIN_IDS.RISE_SEPOLIA]: [
    {
      address: '0x0000000000000000000000000000000000000000', // ETH
      priceFeedId:
        '0xca80ba6dc32e08d06f1aa886011eed1d77c77be9eb761cc10d72b7d0a2fd57a6',
    },
    {
      address: '0x4200000000000000000000000000000000000006', // WETH
      priceFeedId:
        '0xca80ba6dc32e08d06f1aa886011eed1d77c77be9eb761cc10d72b7d0a2fd57a6',
    },
    {
      address: '0xA985e387dDF21b87c1Fe8A0025D827674040221E', // cUSDC
      priceFeedId:
        '0x41f3625971ca2ed2263e78573fe5ce23e13d2558ed3f2e47ab0f84fb9e7ae722',
    },
  ],
}

export const WETH: {
  [chain in CHAIN_IDS]: Currency
} = {
  [CHAIN_IDS.BASE]: {
    address: '0x4200000000000000000000000000000000000006',
    name: 'Wrapped ETH',
    symbol: 'WETH',
    decimals: 18,
  },
  [CHAIN_IDS.MONAD_TESTNET]: {
    address: '0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701',
    name: 'Wrapped Monad Token',
    symbol: 'WMON',
    decimals: 18,
  },
  [CHAIN_IDS.RISE_SEPOLIA]: {
    address: '0x4200000000000000000000000000000000000006',
    name: 'Wrapped ETH',
    symbol: 'WETH',
    decimals: 18,
  },
}

export const WHITELISTED_CURRENCIES: {
  [chain in CHAIN_IDS]: Currency[]
} = {
  [CHAIN_IDS.BASE]: [
    {
      address: zeroAddress,
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
      icon: '/asset-icon/ETH.webp',
    },
  ],
  [CHAIN_IDS.MONAD_TESTNET]: [
    {
      address: zeroAddress,
      name: 'Monad Token',
      symbol: 'MON',
      decimals: 18,
      icon: '/asset-icon/MON.png',
    },
    {
      address: '0xf817257fed379853cDe0fa4F97AB987181B1E5Ea',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      icon: '/asset-icon/USDC.webp',
    },
    // futures
    {
      address: '0x1D074e003E222905e31476A8398e36027141915b',
      name: 'Monad Pre-TGE Futures',
      symbol: 'MON-TGE',
      decimals: 18,
      icon: '/asset-icon/MON-TGE.jpg',
    },
    {
      address: '0xcaeF04f305313080C2538e585089846017193033',
      name: 'USOILSPOT 2025-05-16',
      symbol: 'USOILSPOT-250516',
      decimals: 18,
      icon: '/asset-icon/crude-oil--big.svg',
    },
    {
      address: '0xCAfFD292a5c578Dbd4BBff733F1553bF2cD8850c',
      name: 'XAU 2025-05-16',
      symbol: 'XAU-250516',
      decimals: 18,
      icon: '/asset-icon/gold--big.svg',
    },
    {
      address: '0x746e48E2CDD8F6D0B672adAc7810f55658dC801b',
      name: 'EUR 2025-05-16',
      symbol: 'EUR-250516',
      decimals: 18,
      icon: '/asset-icon/EU--big.svg',
    },
    {
      address: '0x5F433CFeB6CB2743481a096a56007a175E12ae23',
      name: 'BTC 2025-05-16',
      symbol: 'BTC-250516',
      decimals: 18,
      icon: '/asset-icon/XTVCBTC--big.svg',
    },
    {
      address: '0x53E2BB2d88DdC44CC395a0CbCDDC837AeF44116D',
      name: 'AAPL 2025-05-16',
      symbol: 'AAPL-250516',
      decimals: 18,
      icon: '/asset-icon/apple--big.svg',
    },
    {
      address: '0xd57e27D90e04eAE2EEcBc63BA28E433098F72855',
      name: 'GOOGL 2025-05-16',
      symbol: 'GOOGL-250516',
      decimals: 18,
      icon: '/asset-icon/alphabet--big.svg',
    },
    {
      address: '0xDB1Aa7232c2fF7bb480823af254453570d0E4A16',
      name: 'TSLA 2025-05-16',
      symbol: 'TSLA-250516',
      decimals: 18,
      icon: '/asset-icon/tesla--big.svg',
    },
    {
      address: '0x24A08695F06A37C8882CD1588442eC40061e597B',
      name: 'BRK-A 2025-05-16',
      symbol: 'BRK-A-250516',
      decimals: 18,
      icon: '/asset-icon/berkshire-hathaway--big.svg',
    },
    {
      address: '0x41DF9f8a0c014a0ce398A3F2D1af3164ff0F492A',
      name: 'US30Y 2025-05-16',
      symbol: 'US30Y-250516',
      decimals: 18,
      icon: '/asset-icon/US--big.svg',
    },
    //
    {
      address: '0x836047a99e11f376522b447bffb6e3495dd0637c',
      name: 'Orbiter Wrapped ETH',
      symbol: 'oWETH',
      decimals: 18,
      icon: '/asset-icon/weth.jpg',
    },
    {
      address: '0x0EfeD4D9fB7863ccC7bb392847C08dCd00FE9bE2',
      name: 'muBOND',
      symbol: 'muBOND',
      decimals: 18,
      icon: '/asset-icon/mubond.svg',
    },
    {
      address: '0xA296f47E8Ff895Ed7A092b4a9498bb13C46ac768',
      name: 'Wormhole Wrapped ETH',
      symbol: 'wWETH',
      decimals: 18,
      icon: '/asset-icon/wWETH.png',
    },
    {
      address: '0xB5a30b0FDc5EA94A52fDc42e3E9760Cb8449Fb37',
      name: 'WETH',
      symbol: 'WETH',
      decimals: 18,
      icon: '/asset-icon/weth.jpg',
    },
    {
      address: '0xF62F63169cA4085Af82C3a147475EFDe3EdD4b50',
      name: 'Hive Stablecoin',
      symbol: 'HIVE',
      decimals: 18,
      icon: '/asset-icon/hive-usd.png',
    },
    {
      address: '0x43D614B1bA4bA469fAEAa4557AEAFdec039b8795',
      name: 'MockB',
      symbol: 'MOCKB',
      decimals: 6,
    },
    {
      address: '0xb38bb873cca844b20A9eE448a87Af3626a6e1EF5',
      name: 'MistToken',
      symbol: 'MIST',
      decimals: 18,
      icon: '/asset-icon/mist-logo.png',
    },
    {
      address: '0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701',
      name: 'Wrapped Monad Token',
      symbol: 'WMON',
      decimals: 18,
      icon: '/asset-icon/wmonad.svg',
    },
    {
      address: '0x0F0BDEbF0F83cD1EE3974779Bcb7315f9808c714',
      name: 'Molandak',
      symbol: 'DAK',
      decimals: 18,
      icon: '/asset-icon/DAK.png',
    },
    {
      address: '0xfe140e1dCe99Be9F4F15d657CD9b7BF622270C50',
      name: 'Moyaki',
      symbol: 'YAKI',
      decimals: 18,
      icon: '/asset-icon/YAKI.png',
    },
    {
      address: '0xE0590015A873bF326bd645c3E1266d4db41C4E6B',
      name: 'Chog',
      symbol: 'CHOG',
      decimals: 18,
      icon: '/asset-icon/CHOG.png',
    },
    {
      address: '0x3B37b6D72c8149b35F160cdd87f974dd293a094A',
      name: 'RWAGMI',
      symbol: 'RWAGMI',
      decimals: 18,
      icon: '/asset-icon/RWAGMI.png',
    },
    {
      address: '0xb2f82D0f38dc453D596Ad40A37799446Cc89274A',
      name: 'aPriori Monad LST',
      symbol: 'aprMON',
      decimals: 18,
      icon: '/asset-icon/aprMON.jpg',
    },
    {
      address: '0xaEef2f6B429Cb59C9B2D7bB2141ADa993E8571c3',
      name: 'gMON',
      symbol: 'gMON',
      decimals: 18,
      icon: '/asset-icon/gMON.png',
    },
    {
      address: '0xe1d2439b75fb9746E7Bc6cB777Ae10AA7f7ef9c5',
      name: 'StakedMonad',
      symbol: 'sMON',
      decimals: 18,
      icon: '/asset-icon/sMON.svg',
    },
    {
      address: '0x3a98250F98Dd388C211206983453837C8365BDc1',
      name: 'ShMonad',
      symbol: 'shMON',
      decimals: 18,
      icon: '/asset-icon/shMON.png',
    },
    {
      address: '0x88b8E2161DEDC77EF4ab7585569D2415a1C1055D',
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
      icon: '/asset-icon/USDT.png',
    },
  ],
  [CHAIN_IDS.RISE_SEPOLIA]: [
    {
      address: zeroAddress,
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    {
      address: '0x4200000000000000000000000000000000000006',
      name: 'Wrapped ETH',
      symbol: 'WETH',
      decimals: 18,
    },
    {
      address: '0xA985e387dDF21b87c1Fe8A0025D827674040221E',
      name: 'Clober USDC',
      symbol: 'cUSDC',
      decimals: 6,
    },
  ],
}

export const DEFAULT_INPUT_CURRENCY: {
  [chain in CHAIN_IDS]: Currency
} = {
  [CHAIN_IDS.BASE]: {
    address: '0x4200000000000000000000000000000000000006',
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
  },
  [CHAIN_IDS.MONAD_TESTNET]: {
    address: zeroAddress,
    name: 'Monad Token',
    symbol: 'MON',
    decimals: 18,
    icon: '/monad.png',
  },
  [CHAIN_IDS.RISE_SEPOLIA]: {
    address: zeroAddress,
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
}
