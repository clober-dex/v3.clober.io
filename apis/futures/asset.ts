import { getAddress, isAddressEqual } from 'viem'
import { CHAIN_IDS } from '@clober/v2-sdk'

import { Asset } from '../../model/futures/asset'
import { Subgraph } from '../../model/subgraph'
import { FUTURES_SUBGRAPH_ENDPOINT } from '../../constants/subgraph-endpoint'
import { CHAIN_CONFIG } from '../../chain-configs'

type AssetDto = {
  id: string
  assetId: string
  currency: {
    id: string
    name: string
    symbol: string
    decimals: string
  }
  collateral: {
    id: string
    name: string
    symbol: string
    decimals: string
  }
  expiration: string
  maxLTV: string
  liquidationThreshold: string
  minDebt: string
  settlePrice: string
}

const DEFAULT_COLLATERAL = {
  address: '0xf817257fed379853cDe0fa4F97AB987181B1E5Ea',
  name: 'USD Coin',
  symbol: 'USDC',
  decimals: 6,
  priceFeedId:
    '0x41f3625971ca2ed2263e78573fe5ce23e13d2558ed3f2e47ab0f84fb9e7ae722',
}

export const fetchFuturesAssets = async (
  chainId: CHAIN_IDS,
): Promise<Asset[]> => {
  if (!FUTURES_SUBGRAPH_ENDPOINT[chainId]) {
    return []
  }
  const {
    data: { assets },
  } = await Subgraph.get<{
    data: {
      assets: AssetDto[]
    }
  }>(
    FUTURES_SUBGRAPH_ENDPOINT[chainId]!,
    'getAssets',
    'query getAssets { assets { id assetId currency { id name symbol decimals } collateral { id name symbol decimals } expiration maxLTV liquidationThreshold minDebt settlePrice } }',
    {},
  )
  return assets
    .map((asset) => {
      const currency = CHAIN_CONFIG.WHITELISTED_CURRENCIES.find((currency) =>
        isAddressEqual(currency.address, getAddress(asset.currency.id)),
      )
      if (
        !currency ||
        !isAddressEqual(currency.address, getAddress(asset.collateral.id))
      ) {
        return undefined
      }
      return {
        id: getAddress(asset.id),
        currency: {
          address: getAddress(asset.currency.id),
          name: asset.currency.name,
          symbol: asset.currency.symbol,
          decimals: Number(asset.currency.decimals),
          priceFeedId: asset.assetId as `0x${string}`,
          icon: currency.icon,
        },
        collateral: DEFAULT_COLLATERAL,
        expiration: Number(asset.expiration),
        maxLTV: BigInt(asset.maxLTV),
        liquidationThreshold: BigInt(asset.liquidationThreshold),
        ltvPrecision: 1000000n,
        minDebt: BigInt(asset.minDebt),
        settlePrice: Number(asset.settlePrice),
      }
    })
    .filter((asset) => asset !== undefined) as Asset[]
}
