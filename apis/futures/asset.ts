import { getAddress, isAddressEqual } from 'viem'
import { CHAIN_IDS } from '@clober/v2-sdk'

import { Asset } from '../../model/futures/asset'
import { Subgraph } from '../../model/subgraph'
import { FUTURES_COLLATERALS } from '../../constants/futures/collaterals'
import { FUTURES_SUBGRAPH_ENDPOINT } from '../../constants/subgraph-endpoint'
import { WHITELISTED_CURRENCIES } from '../../constants/currency'

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
      const collateral = FUTURES_COLLATERALS.find((collateral) =>
        isAddressEqual(collateral.address, getAddress(asset.collateral.id)),
      )
      const currency = WHITELISTED_CURRENCIES[chainId].find((currency) =>
        isAddressEqual(currency.address, getAddress(asset.currency.id)),
      )
      if (!collateral || !currency) {
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
        collateral,
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
