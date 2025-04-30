import {
  createPublicClient,
  getAddress,
  http,
  isAddressEqual,
  zeroAddress,
} from 'viem'
import axios from 'axios'
import { monadTestnet } from 'viem/chains'
import { CHAIN_IDS } from '@clober/v2-sdk'

import { ANALYTICS_SUBGRAPH_ENDPOINT } from '../constants/subgraph-endpoint'
import { Chain } from '../model/chain'
import { Subgraph } from '../model/subgraph'
import { RPC_URL } from '../constants/rpc-url'
import { ERC20_PERMIT_ABI } from '../abis/@openzeppelin/erc20-permit-abi'
import { DailyActivitySnapshot } from '../model/snapshot'

const BLACKLISTED_USER_ADDRESSES = [
  '0x5F79EE8f8fA862E98201120d83c4eC39D9468D49',
  '0xCcd0964F534c4583C35e07E47AbE8984A6bB1534',
].map((address) => getAddress(address))

export const fetchUserVolume = async (
  chainId: CHAIN_IDS,
  userAddress: `0x${string}`,
): Promise<{
  address: `0x${string}`
  rank: number
  totalVolumeUsd: number
} | null> => {
  if (chainId !== monadTestnet.id) {
    return null
  }

  const {
    data: { my_rank },
  } = await axios.get<{
    my_rank: {
      wallet: `0x${string}`
      rank: number
      total_volume_usd: number
    } | null
  }>(`/api/chains/10143/leaderboard/user-address/${userAddress}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (!my_rank) {
    return null
  }
  return {
    address: getAddress(my_rank.wallet),
    rank: BLACKLISTED_USER_ADDRESSES.includes(getAddress(my_rank.wallet))
      ? -1
      : my_rank.rank,
    totalVolumeUsd: my_rank.total_volume_usd,
  }
}

export const fetchVolumeLeaderboard = async (
  chainId: CHAIN_IDS,
): Promise<
  {
    address: `0x${string}`
    totalVolumeUsd: number
  }[]
> => {
  if (chainId !== monadTestnet.id) {
    return []
  }

  const {
    data: { results },
  } = await axios.get<{
    results: {
      wallet: `0x${string}`
      total_volume_usd: number
    }[]
  }>('/api/chains/10143/leaderboard', {
    headers: {
      'Content-Type': 'application/json',
    },
  })

  return results
    .filter(
      (item) =>
        !BLACKLISTED_USER_ADDRESSES.some((address) =>
          isAddressEqual(getAddress(item.wallet), address),
        ),
    )
    .map((item) => ({
      address: getAddress(item.wallet),
      totalVolumeUsd: item.total_volume_usd,
    }))
}

export const fetchWalletDayData = async (
  chain: Chain,
  userAddress: `0x${string}`,
): Promise<
  {
    timestamp: number
    volumeSnapshots: DailyActivitySnapshot['volumeSnapshots']
  }[]
> => {
  if (!ANALYTICS_SUBGRAPH_ENDPOINT[chain.id]) {
    return []
  }

  const {
    data: { walletDayDatas },
  } = await Subgraph.get<{
    data: {
      walletDayDatas: {
        date: string
        tokenVolumes: { token: string; volume: string }[]
      }[]
    }
  }>(
    ANALYTICS_SUBGRAPH_ENDPOINT[chain.id]!,
    'getWalletDayDatas',
    'query getWalletDayDatas($userAddress: Bytes!) { walletDayDatas(where: {wallet: $userAddress}) { date tokenVolumes { token volume } } }',
    {
      userAddress: userAddress.toLowerCase(),
    },
  )
  const tokenAddresses = [
    ...new Set(
      walletDayDatas.flatMap((item) =>
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

  return walletDayDatas.map((item) => {
    const volumeSnapshots = item.tokenVolumes.map(({ volume, token }) => ({
      symbol: tokenInfoMap.get(getAddress(token))?.symbol ?? '',
      amount:
        Number(volume) /
        10 ** (tokenInfoMap.get(getAddress(token))?.decimals ?? 0),
      address: getAddress(token),
    }))
    return {
      timestamp: Number(item.date),
      volumeSnapshots,
    }
  })
}
