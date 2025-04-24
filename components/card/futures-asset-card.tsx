import React, { useMemo } from 'react'
import { NextRouter } from 'next/router'
import { getAddress } from 'viem'

import { CurrencyIcon } from '../icon/currency-icon'
import { Asset } from '../../model/futures/asset'
import { formatDate } from '../../utils/date'
import { Chain } from '../../model/chain'

export const FuturesAssetCard = ({
  chain,
  asset,
  router,
}: {
  chain: Chain
  asset: Asset
  router: NextRouter
}) => {
  const ltv = (Number(asset.maxLTV) * 100) / Number(asset.ltvPrecision)
  const symbol = useMemo(() => {
    const symbol = asset.currency.symbol
    return symbol.slice(0, symbol.lastIndexOf('-'))
  }, [asset.currency.symbol])

  return (
    <>
      <div className="hidden lg:flex w-[1040px] h-16 px-5 py-4 bg-gray-800 rounded-2xl justify-start items-center gap-4">
        <div className="flex w-44 items-center gap-2">
          <div className="w-8 h-8 shrink-0 relative">
            <CurrencyIcon
              chain={chain}
              currency={asset.currency}
              className="w-8 h-8 absolute left-0 top-0 z-[1] rounded-full"
            />
          </div>
          <div className="flex items-center text-white text-base font-bold gap-1">
            {symbol}
          </div>
        </div>
        <div className="flex w-36 items-center gap-2">
          <div className="w-8 h-8 shrink-0 relative">
            <CurrencyIcon
              chain={chain}
              currency={asset.collateral}
              className="w-8 h-8 absolute left-0 top-0 z-[1] rounded-full"
            />
          </div>
          <div className="flex items-center text-white text-base font-bold gap-1">
            {asset.collateral.symbol}
          </div>
        </div>
        <div className="w-[160px] text-white text-base font-bold text-nowrap">
          {formatDate(new Date(asset.expiration * 1000))}
        </div>
        <div className="w-[140px] text-white text-base font-bold">
          {ltv.toFixed(2)} %
        </div>
        <div className="flex flex-row gap-2">
          <button
            onClick={() => {
              router.push(
                `/trade?inputCurrency=${asset.currency.address}&outputCurrency=${asset.collateral.address}`,
              )
            }}
            className="flex w-32 h-8 px-3 py-2 bg-blue-500 rounded-lg justify-center items-center gap-1"
          >
            <div className="grow shrink basis-0 opacity-90 text-center text-white text-sm font-bold">
              Trade
            </div>
          </button>
          <button
            onClick={() => router.push(`/futures/mint/${asset.id}`)}
            className="flex w-32 h-8 px-3 py-2 bg-blue-500 rounded-lg justify-center items-center gap-1"
          >
            <div className="grow shrink basis-0 opacity-90 text-center text-white text-sm font-bold">
              Mint
            </div>
          </button>
        </div>
      </div>

      <div className="flex lg:hidden w-full h-[116px] p-4 bg-gray-800 rounded-xl flex-col justify-center items-start gap-4">
        <div className="flex items-center gap-2 self-stretch">
          <div className="w-6 h-6 relative">
            <CurrencyIcon
              chain={chain}
              currency={asset.currency}
              className="w-6 h-6 absolute left-0 top-0 z-[1] rounded-full"
            />
          </div>
          <div className="flex gap-1 justify-start items-center">
            <div className="text-white text-base font-bold">{symbol}</div>
          </div>
          <button
            onClick={() => router.push(`/futures/mint/${getAddress(asset.id)}`)}
            className="flex ml-auto"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M12.6665 7.99984L3.33317 7.99984M12.6665 7.99984L9.99984 5.33317M12.6665 7.99984L9.99984 10.6665"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <div className="w-full flex flex-row flex-1 h-11 justify-start items-start gap-2">
          <div className="flex flex-1 flex-col gap-2 w-16">
            <div className="self-stretch text-gray-400 text-xs">Collateral</div>
            <div className="self-stretch text-white text-sm font-bold">
              {asset.collateral.symbol}
            </div>
          </div>
          <div className="flex flex-1 w-full flex-col gap-2">
            <div className="self-stretch text-gray-400 text-xs">
              Expiry Date
            </div>
            <div className="self-stretch text-white text-sm font-bold text-nowrap">
              {formatDate(new Date(asset.expiration * 1000))}
            </div>
          </div>
          <div className="flex flex-1 w-full flex-col gap-2">
            <div className="self-stretch text-gray-400 text-xs">Max LTV</div>
            <div className="self-stretch text-white text-sm font-bold">
              {ltv.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
