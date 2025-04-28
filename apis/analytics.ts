import { CHAIN_IDS } from '@clober/v2-sdk'
import {
  createPublicClient,
  getAddress,
  http,
  isAddressEqual,
  zeroAddress,
} from 'viem'

import { Subgraph } from '../model/subgraph'
import { DailyActivitySnapshot } from '../model/snapshot'
import { RPC_URL } from '../constants/rpc-url'
import { Chain } from '../model/chain'
import { ERC20_PERMIT_ABI } from '../abis/@openzeppelin/erc20-permit-abi'
import { formatUnits } from '../utils/bigint'

export const fetchDailyActivitySnapshot = async (
  chain: Chain,
): Promise<DailyActivitySnapshot[]> => {
  if (chain.id !== CHAIN_IDS.MONAD_TESTNET) {
    return []
  }
  const {
    data: { cloberDayDatas },
  } = await Subgraph.get<{
    data: {
      cloberDayDatas: {
        id: string
        txCount: string
        walletCount: string
        tokenVolumes: { token: string; volume: string }[]
        transactionTypes: { type: string; txCount: string }[]
      }[]
    }
  }>(
    'https://api.goldsky.com/api/public/project_clsljw95chutg01w45cio46j0/subgraphs/clober-analytics-subgraph-monad-testnet/v1.0.4/gn',
    '',
    '{ cloberDayDatas { id txCount walletCount tokenVolumes { token volume } transactionTypes { type txCount } } }',
    {},
  )
  const tokenAddresses = [
    ...new Set(
      cloberDayDatas.flatMap((item) =>
        item.tokenVolumes.map((volume) => volume.token),
      ),
    ),
  ]
    .map((address) => getAddress(address))
    .filter((address) => !isAddressEqual(address, zeroAddress))
  const publicClient = createPublicClient({
    chain,
    transport: http(RPC_URL[chain.id]),
  })
  const results = await publicClient.multicall({
    contracts: tokenAddresses.flatMap((address) => [
      { address, abi: ERC20_PERMIT_ABI, functionName: 'symbol' },
      { address, abi: ERC20_PERMIT_ABI, functionName: 'decimals' },
    ]),
  })

  const tokenInfoMap = tokenAddresses.reduce(
    (map, address, i) => {
      map.set(getAddress(address), {
        symbol: results[i * 2].result as string,
        decimals: Number(results[i * 2 + 1].result),
      })
      return map
    },
    new Map<string, { symbol: string; decimals: number }>([
      [
        zeroAddress,
        {
          symbol: chain.nativeCurrency.symbol,
          decimals: chain.nativeCurrency.decimals,
        },
      ],
    ]),
  )

  return cloberDayDatas.map((item) => {
    const volumeSnapshots = item.tokenVolumes
      .map(({ token, volume }) => ({
        address: getAddress(token),
        symbol: (tokenInfoMap.get(getAddress(token))?.symbol ?? '') as string,
        amount: Number(
          formatUnits(
            BigInt(volume),
            Number(tokenInfoMap.get(getAddress(token))?.decimals ?? 18),
          ),
        ),
      }))
      .filter(
        (volumeSnapshot) =>
          volumeSnapshot.amount > 0 && volumeSnapshot.symbol !== '',
      )
    const transactionTypeSnapshots = item.transactionTypes.map(
      ({ type, txCount }) => ({
        type,
        count: Number(txCount),
      }),
    )
    return {
      timestamp: Number(item.id),
      volumeSnapshots,
      transactionTypeSnapshots,
      walletCount: Number(item.walletCount),
      transactionCount: Number(item.txCount),
    }
  })
}
