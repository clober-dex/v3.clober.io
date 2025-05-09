import { CHAIN_IDS } from '@clober/v2-sdk'
import { getAddress } from 'viem'

export const FUTURES_CONTRACT_ADDRESSES: {
  [chain in CHAIN_IDS]:
    | {
        FuturesMarket: `0x${string}`
        PythOracle: `0x${string}`
        TradingCompetitionRegistration: `0x${string}`
      }
    | undefined
} = {
  [CHAIN_IDS.BASE]: undefined,
  [CHAIN_IDS.MONAD_TESTNET]: {
    FuturesMarket: getAddress('0x56b88CFe40d592Ec4d4234043e039d7CA807f110'),
    PythOracle: getAddress('0xad2B52D2af1a9bD5c561894Cdd84f7505e1CD0B5'),
    TradingCompetitionRegistration: getAddress(
      '0x58e84BAc13e19966A17F7Df370d3452bb0c23BF7',
    ),
  },
  [CHAIN_IDS.RISE_SEPOLIA]: undefined,
}
