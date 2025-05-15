import { CHAIN_IDS, getContractAddresses } from '@clober/v2-sdk'
import { getAddress } from 'viem'
import { monadTestnet } from 'viem/chains'

import { Aggregator } from '../model/aggregator'
import { OpenOceanAggregator } from '../model/aggregator/openocean'
import { CloberV2Aggregator } from '../model/aggregator/clober-v2'
import { AggregatorRouterGateway } from '../model/aggregator/router-gateway'

export const AGGREGATORS: Aggregator[] = [
  new CloberV2Aggregator(
    getContractAddresses({ chainId: CHAIN_IDS.MONAD_TESTNET }).Controller,
    monadTestnet,
  ),
  // new OpenOceanAggregator(
  //   getAddress('0x6352a56caadC4F1E25CD6c75970Fa768A3304e64'),
  //   monadTestnet,
  // ),
  new AggregatorRouterGateway(
    getAddress('0xfD845859628946B317A78A9250DA251114FbD846'),
    monadTestnet,
    new OpenOceanAggregator(
      getAddress('0x6352a56caadC4F1E25CD6c75970Fa768A3304e64'),
      monadTestnet,
    ),
  ),
]
