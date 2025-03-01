import React, { useMemo, useState } from 'react'
import { parseUnits } from 'viem'

import { Asset } from '../../model/future/asset'
import { MintFutureAssetForm } from '../../components/form/future/mint-future-asset-form'
import { useCurrencyContext } from '../../contexts/currency-context'
import {
  calculateLiquidationPrice,
  calculateLtv,
  calculateMaxLoanableAmount,
} from '../../utils/ltv'
import { formatUnits } from '../../utils/bigint'
import { useFutureContractContext } from '../../contexts/future/future-contract-context'

export const FutureManagerContainer = ({ asset }: { asset: Asset }) => {
  const { balances, prices } = useCurrencyContext()
  const { borrow } = useFutureContractContext()
  const [collateralValue, setCollateralValue] = useState('')
  const [borrowValue, setBorrowValue] = useState('')

  const [debtAmount, collateralAmount, collateralUserBalance] = useMemo(() => {
    return [
      parseUnits(borrowValue || '0', asset.currency.decimals),
      parseUnits(collateralValue || '0', asset.collateral.decimals),
      balances[asset.collateral.address] ?? 0n,
    ]
  }, [
    asset.collateral.address,
    asset.collateral.decimals,
    asset.currency.decimals,
    balances,
    borrowValue,
    collateralValue,
  ])

  const maxBorrowAmount = useMemo(
    () =>
      calculateMaxLoanableAmount(
        asset.currency,
        parseUnits((prices[asset.currency.address] ?? 0).toFixed(18), 18),
        asset.collateral,
        parseUnits((prices[asset.collateral.address] ?? 0).toFixed(18), 18),
        collateralAmount,
        asset.maxLTV,
        asset.ltvPrecision,
      ),
    [
      asset.collateral,
      asset.currency,
      asset.ltvPrecision,
      asset.maxLTV,
      collateralAmount,
      prices,
    ],
  )
  const isDeptSizeLessThanMinDebtSize = useMemo(
    () => asset.minDebt > 0n && debtAmount < asset.minDebt,
    [asset.minDebt, debtAmount],
  )

  return (
    <MintFutureAssetForm
      asset={asset}
      maxBorrowAmount={maxBorrowAmount}
      borrowLTV={calculateLtv(
        asset.currency,
        prices[asset.currency.address] ?? 0,
        debtAmount,
        asset.collateral,
        prices[asset.collateral.address] ?? 0,
        collateralAmount,
      )}
      collateralValue={collateralValue}
      setCollateralValue={setCollateralValue}
      borrowValue={borrowValue}
      setBorrowValue={setBorrowValue}
      balances={balances}
      prices={prices}
      liquidationPrice={calculateLiquidationPrice(
        asset.currency,
        prices[asset.currency.address] ?? 0,
        asset.collateral,
        prices[asset.collateral.address] ?? 0,
        debtAmount,
        collateralAmount,
        asset.liquidationThreshold,
        asset.ltvPrecision,
      )}
      actionButtonProps={{
        disabled:
          collateralAmount === 0n ||
          debtAmount === 0n ||
          collateralAmount > collateralUserBalance ||
          debtAmount > maxBorrowAmount ||
          isDeptSizeLessThanMinDebtSize,
        onClick: async () => {
          await borrow(asset, collateralAmount, debtAmount)
        },
        text:
          collateralAmount === 0n
            ? 'Enter collateral amount'
            : debtAmount === 0n
              ? 'Enter loan amount'
              : collateralAmount > collateralUserBalance
                ? `Insufficient ${asset.collateral.symbol} balance`
                : debtAmount > maxBorrowAmount
                  ? 'Not enough collateral'
                  : isDeptSizeLessThanMinDebtSize
                    ? `Remaining debt must be ≥ ${formatUnits(
                        asset.minDebt,
                        asset.currency.decimals,
                        prices[asset.currency.address] ?? 0,
                      )} ${asset.currency.symbol}`
                    : 'Borrow',
      }}
    />
  )
}
