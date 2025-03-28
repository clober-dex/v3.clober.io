import { getAddress, isAddressEqual } from 'viem'

import { Subgraph } from '../../constants/subgraph'
import { UserPosition } from '../../model/future/user-position'
import { Prices } from '../../model/prices'
import { calculateLiquidationPrice, calculateLtv } from '../../utils/ltv'
import { formatUnits } from '../../utils/bigint'
import { COLLATERALS } from '../../constants/future/collateral'
import { ASSET_ICONS, WHITE_LISTED_ASSETS } from '../../constants/future/asset'

type ShortPositionDto = {
  id: string
  user: string
  asset: {
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
  collateralAmount: string
  debtAmount: string
  averagePrice: string
}

export const fetchFuturePositions = async (
  chainId: number,
  userAddress: `0x${string}`,
  price: Prices,
): Promise<UserPosition[]> => {
  const {
    data: { shortPositions },
  } = await Subgraph.get<{
    data: {
      shortPositions: ShortPositionDto[]
    }
  }>(
    'https://api.goldsky.com/api/public/project_clsljw95chutg01w45cio46j0/subgraphs/clober-future-subgraph-monad-testnet/v1.0.0/gn',
    'getPositions',
    'query getPositions($userAddress: String!) { shortPositions (where: {user: $userAddress }) { id user asset { id assetId currency { id name symbol decimals } collateral { id name symbol decimals } expiration maxLTV settlePrice liquidationThreshold minDebt } collateralAmount debtAmount averagePrice } }',
    {
      userAddress: userAddress.toLowerCase(),
    },
  )

  return [
    ...shortPositions.map((position) => {
      const debtCurrency = {
        address: getAddress(position.asset.currency.id),
        name: position.asset.currency.name,
        symbol: position.asset.currency.symbol,
        decimals: Number(position.asset.currency.decimals),
        priceFeedId: position.asset.assetId as `0x${string}`,
      }
      const averagePrice = Number(position.averagePrice)
      const debtAmountDB = Number(
        formatUnits(BigInt(position.debtAmount), debtCurrency.decimals),
      )
      const collateral = COLLATERALS[chainId].find((collateral) =>
        isAddressEqual(
          collateral.address,
          position.asset.collateral.id as `0x${string}`,
        ),
      )
      if (!collateral) {
        return undefined
      }
      return {
        user: getAddress(position.user),
        asset: {
          id: getAddress(position.asset.id),
          currency: {
            ...debtCurrency,
            icon: ASSET_ICONS[position.asset.assetId],
          },
          collateral,
          expiration: Number(position.asset.expiration),
          maxLTV: BigInt(position.asset.maxLTV),
          liquidationThreshold: BigInt(position.asset.liquidationThreshold),
          ltvPrecision: 1000000n,
          minDebt: BigInt(position.asset.minDebt),
          settlePrice: Number(position.asset.settlePrice),
        },
        type: 'short' as const,
        collateralAmount: BigInt(position.collateralAmount),
        debtAmount: BigInt(position.debtAmount),
        liquidationPrice: calculateLiquidationPrice(
          debtCurrency,
          price[debtCurrency.address],
          collateral,
          price[collateral.address],
          BigInt(position.debtAmount),
          BigInt(position.collateralAmount),
          BigInt(position.asset.liquidationThreshold),
          1000000n,
        ),
        ltv: calculateLtv(
          debtCurrency,
          price[debtCurrency.address],
          BigInt(position.debtAmount),
          collateral,
          price[collateral.address],
          BigInt(position.collateralAmount),
        ),
        averagePrice,
        pnl: averagePrice / price[debtCurrency.address],
        profit: debtAmountDB * (averagePrice - price[debtCurrency.address]),
      }
    }),
  ].filter(
    (position) =>
      position &&
      price[position.asset.currency.address] > 0 &&
      WHITE_LISTED_ASSETS.includes(position.asset.currency.address),
  ) as UserPosition[]
}
