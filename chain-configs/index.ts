import { monadTestnet } from 'viem/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { getAddress, http, zeroAddress } from 'viem'
import {
  backpackWallet,
  coinbaseWallet,
  metaMaskWallet,
  phantomWallet,
  rainbowWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { getNativeCurrency, getReferenceCurrency } from '@clober/v2-sdk'
import colors from 'tailwindcss/colors'

import { ChainConfig } from './type'
import { PAGE_BUTTONS } from './page-button'

const CHAIN = {
  ...monadTestnet,
  icon: '/chain-logo-images/monad.png',
}
export const CHAIN_CONFIG: ChainConfig = {
  CHAIN,
  TITLE: 'Fully On-chain Order Book',
  DEX_NAME: 'Clober',
  COLOR: colors.blue,
  URL: 'https://app.clober.io',
  LANDING_PAGE_URL: 'https://clober.io',
  TWITTER_HANDLE: '@CloberDEX',
  GITHIB_URL: 'https://github.com/clober-dex/',
  DISCORD_URL: 'https://discord.gg/clober-dex',
  DOCS_URL: 'https://docs.clober.io/',
  RAINBOW_KIT_PROJECT_ID: '14e09398dd595b0d1dccabf414ac4531',
  GOOGLE_ANALYTICS_TRACKING_ID: 'G-TE8CSB6JP2',
  RPC_URL:
    'https://proud-tiniest-flower.monad-testnet.quiknode.pro/a4ebe00fca2e7bf01201f3b0f7fe2f0077c52a36',
  PYTH_HERMES_ENDPOINT: 'https://hermes-beta.pyth.network',
  ANALYTICS_VOLUME_BLACKLIST: [
    { timestamp: 1743638400, address: zeroAddress },
    {
      timestamp: 1743638400,
      address: getAddress('0xb2f82D0f38dc453D596Ad40A37799446Cc89274A'),
    },
  ],
  EXTERNAL_CONTRACT_ADDRESSES: {
    FuturesMarket: getAddress('0x56b88CFe40d592Ec4d4234043e039d7CA807f110'),
    PythOracle: getAddress('0xad2B52D2af1a9bD5c561894Cdd84f7505e1CD0B5'),
    TradingCompetitionRegistration: getAddress(
      '0x58e84BAc13e19966A17F7Df370d3452bb0c23BF7',
    ),
  },
  BLACKLISTED_USERS: [
    '0x5F79EE8f8fA862E98201120d83c4eC39D9468D49',
    '0xCcd0964F534c4583C35e07E47AbE8984A6bB1534',
  ],
  EXTERNAL_SUBGRAPH_ENDPOINTS: {
    FUTURES:
      'https://subgraph.satsuma-prod.com/f6a8c4889b7b/clober/clober-futures-subgraph-monad-testnet/api',
    LIQUIDITY_VAULT_POINT:
      'https://api.goldsky.com/api/public/project_clsljw95chutg01w45cio46j0/subgraphs/liquidity-vault-point-monad-testnet/latest/gn',
  },
  WHITELISTED_POOL_KEYS: [
    '0xad46920833ad7a1ba8e74cc241faf9ae4fd3dc4616ad9648b13160f8453e444f', // MON-USDC
    '0xf3c347e880b6a775f4f69f6db22860636351a70f18857fab2c56dc32835a1627', // muBOND-USDC
    '0xebadcf03683413b3fc72a0d16a0a02902db04ee7a3b439de5033e825c1d79380', // aprMON-MON
    '0x2b4a8f6c598547dede3868e214f4f1e972deff1508ad7667d7556264662a5796', // HIVE-USDC
    '0xb93510cb90a836b00a33a7452fde41230b3a53fbb804e64737c7cd7533ea14f8', // gMON-MON
    '0x5913968b69d49b992c13c017d99f982eaa0764b6f6c8d6709e6061f7cdbe1d8c', // sMON-MON
    '0xd1e33fe9673f7b2957cf31bea350b7f99795ee9cfea2392e9a92be6ba32e9a32', // shMON-MON
    // futures
  ],
  REFERENCE_CURRENCY: getReferenceCurrency({ chainId: CHAIN.id }),
  DEFAULT_INPUT_CURRENCY: getNativeCurrency({ chainId: CHAIN.id }),
  WHITELISTED_CURRENCIES: [
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
}

let config: any | null = null
export const getClientConfig = () => {
  if (typeof window === 'undefined') {
    return null
  }
  if (config) {
    return config
  }

  config = getDefaultConfig({
    appName: CHAIN_CONFIG.DEX_NAME,
    projectId: CHAIN_CONFIG.RAINBOW_KIT_PROJECT_ID,
    chains: [CHAIN],
    transports: {
      [CHAIN.id]: http(CHAIN_CONFIG.RPC_URL),
    },
    wallets: [
      {
        groupName: 'Recommended',
        wallets: [
          backpackWallet,
          metaMaskWallet,
          coinbaseWallet,
          rainbowWallet,
          walletConnectWallet,
          phantomWallet,
        ],
      },
    ],
  })

  return config
}
