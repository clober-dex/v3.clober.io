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
import { getStartOfTodayTimestampInSeconds } from '../utils/date'
import { ANALYTICS_SUBGRAPH_ENDPOINT } from '../constants/subgraph-endpoint'

const BLACKLISTED_TOKENS: `0x${string}`[] = [
  '0x836047a99e11f376522b447bffb6e3495dd0637c',
  '0xA296f47E8Ff895Ed7A092b4a9498bb13C46ac768',
  '0xB5a30b0FDc5EA94A52fDc42e3E9760Cb8449Fb37',
]

const FUNCTION_SIG_MAP: Record<string, string> = {
  '0x7d773110': 'Limit',
  '0xfe815746': 'Limit',
  '0x8feb85b7': 'Claim',
  '0xa04c796b': 'Cancel',
  '0xc0e8e89a': 'Market',
  '0x4f28185a': 'Add-Liq',
  '0x0a31b953': 'Remove-Liq',
  '0x7e865aa4': 'Swap',
  '0xa0f15331': '', // update position
  '0xed56531a': '', // pause
  '0xf4dfd83a': '', // arbitrage
}

export const fetchDailyActivitySnapshot = async (
  chain: Chain,
): Promise<DailyActivitySnapshot[]> => {
  if (!ANALYTICS_SUBGRAPH_ENDPOINT[chain.id]) {
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
        newWalletCount: string
        tokenVolumes: { token: string; volume: string }[]
        transactionTypes: { type: string; txCount: string }[]
      }[]
    }
  }>(
    'https://api.goldsky.com/api/public/project_clsljw95chutg01w45cio46j0/subgraphs/clober-analytics-subgraph-monad-testnet/latest/gn',
    '',
    '{ cloberDayDatas { id txCount walletCount newWalletCount tokenVolumes { token volume } transactionTypes { type txCount } } }',
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

  const startOfTodayTimestampInSeconds = getStartOfTodayTimestampInSeconds()
  return cloberDayDatas
    .map((item) => {
      const volumeSnapshots = item.tokenVolumes
        .map(({ token, volume }) => ({
          address: getAddress(token),
          symbol: (tokenInfoMap.get(getAddress(token))?.symbol ?? '') as string,
          amount:
            Number(
              formatUnits(
                BigInt(volume),
                Number(tokenInfoMap.get(getAddress(token))?.decimals ?? 18),
              ),
            ) / 2, // div 2 to avoid double counting
        }))
        .filter(
          (volumeSnapshot) =>
            volumeSnapshot.amount > 0 &&
            volumeSnapshot.symbol !== '' &&
            BLACKLISTED_TOKENS.map((address) => getAddress(address)).indexOf(
              getAddress(volumeSnapshot.address),
            ) === -1,
        )
      const transactionTypeSnapshots = item.transactionTypes
        .map(({ type, txCount }) => ({
          type: FUNCTION_SIG_MAP[type] ?? type,
          count: Number(txCount),
        }))
        // if the type is not in FUNCTION_SIG_MAP, it means it's a normal transaction
        .reduce(
          (acc, { type, count }) => {
            const existing = acc.find((item) => item.type === type)
            if (existing) {
              existing.count += count
            } else {
              acc.push({ type, count })
            }
            return acc
          },
          [] as { type: string; count: number }[],
        )
        .filter(
          (transactionTypeSnapshot) =>
            transactionTypeSnapshot.count > 0 &&
            transactionTypeSnapshot.type !== '' &&
            transactionTypeSnapshot.type.indexOf('0x') !== 0,
        )
      return {
        timestamp: Number(item.id),
        volumeSnapshots,
        transactionTypeSnapshots,
        walletCount: Number(item.walletCount),
        newWalletCount: Number(item.newWalletCount),
        transactionCount: Number(item.txCount),
      }
    })
    .filter(({ timestamp }) => timestamp < startOfTodayTimestampInSeconds)
}
