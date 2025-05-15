import React, { useMemo } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { isAddressEqual } from 'viem'

import { TRADING_VIEW_SYMBOLS } from '../../../constants/asset'
import { FuturesManagerContainer } from '../../../containers/futures/futures-manager-container'
import BackSvg from '../../../components/svg/back-svg'
import { TradingViewContainer } from '../../../containers/chart/trading-view-container'
import { useFuturesContext } from '../../../contexts/futures/futures-context'
import { NativeChartContainer } from '../../../containers/chart/native-chart-container'

export default function MintFutureAssetManage() {
  const router = useRouter()
  const { assets } = useFuturesContext()
  const asset = assets?.find(
    (asset) =>
      router.query.assetKey &&
      isAddressEqual(asset.id, router.query.assetKey as `0x${string}`),
  )
  const symbol = useMemo(() => {
    if (!asset) {
      return ''
    }
    const symbol = asset.currency.symbol
    return symbol.slice(0, symbol.lastIndexOf('-'))
  }, [asset])

  return router.query.assetKey && asset ? (
    <div className="flex flex-1 w-full">
      <Head>
        <title>Mint {asset.currency.symbol}</title>
      </Head>

      <main className="flex flex-1 flex-col justify-center items-center">
        <div className="flex flex-1 flex-col w-full gap-6">
          <Link
            className="flex items-center font-bold text-base sm:text-2xl gap-2 sm:gap-3 mt-4 mb-2 sm:mb-2 ml-4 sm:ml-6"
            replace={true}
            href="/futures"
          >
            <BackSvg className="w-4 h-4 sm:w-8 sm:h-8" />
            <div className="flex gap-2 lg:gap-4">
              Short <span>{symbol}</span>
            </div>
          </Link>
          <div className="flex flex-col lg:flex-row sm:items-center lg:items-start justify-center gap-4 mb-4 px-2 md:px-0">
            {TRADING_VIEW_SYMBOLS[asset.currency.priceFeedId] ? (
              <TradingViewContainer
                symbol={TRADING_VIEW_SYMBOLS[asset.currency.priceFeedId]}
              />
            ) : (
              <NativeChartContainer
                baseCurrency={asset.currency}
                quoteCurrency={asset.collateral}
              />
            )}
            <FuturesManagerContainer asset={asset} />
          </div>
        </div>
      </main>
    </div>
  ) : (
    <></>
  )
}
