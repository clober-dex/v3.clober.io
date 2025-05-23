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
import { WHITELISTED_CURRENCIES } from './currency'

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
    '0xd2853e69b50a0e58bfcc62e54e5e206a2e994e7671ff606829dc0d33b783dd19', // US30Y
    '0x058038cd3b5d6ceedf3ee5f81d42338fd8a26831130abcabd1077b473cdd5650', // EUR
    '0x3a9ef5c24df6829cba45c34c8f59fafaf525dbba114f5d1f2cd0d48763315721', // S&P500
    '0x045ea7b6fb91e7bf32ca5d8bc34325a2fd70e33b6174229c05ab209221195f15', // XAU
    '0xf4c7b58425fdcdc201391c1ef4b7042b05586da10c5b59497cb5805f7ee3106e', // ETHBTC
    '0x8889f39dd8e24149e60682eec0b1e2b4185f2530d8f6b8b974018c225b9d1682', // BTC
    '0xd16f03f88b950ba9dbd0de0d71ed998a48db96fcca8ffb3e0a262ad098c8999b', // USOIL
  ],
  REFERENCE_CURRENCY: getReferenceCurrency({ chainId: CHAIN.id }),
  DEFAULT_INPUT_CURRENCY: getNativeCurrency({ chainId: CHAIN.id }),
  WHITELISTED_CURRENCIES: WHITELISTED_CURRENCIES,
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
