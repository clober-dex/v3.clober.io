import React, { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { UTCTimestamp } from 'lightweight-charts'
import { getAddress, isAddressEqual } from 'viem'

import { HistogramChart } from '../components/chart/histogram-chart'
import { useChainContext } from '../contexts/chain-context'
import { useCurrencyContext } from '../contexts/currency-context'
import RedirectIfNotMonadTestnetContainer from '../containers/redirect-if-not-monad-testnet-container'

export default function Analytics() {
  const { prices, whitelistCurrencies } = useCurrencyContext()
  const { selectedChain } = useChainContext()

  const { data: analytics } = useQuery({
    queryKey: ['analytics', selectedChain.id],
    queryFn: async () => {
      try {
        const {
          data: { snapshots },
        } = await axios.get<{
          snapshots: {
            timestamp: number
            googleAnalyticsActiveUsers: number
            walletCount: number
            transactionCount: number
            volumeSnapshots: {
              symbol: string
              amount: number
              address: `0x${string}`
            }[]
          }[]
        }>(`/api/chains/${selectedChain.id}/analytics`)
        return snapshots.sort((a, b) => a.timestamp - b.timestamp)
      } catch {
        return []
      }
    },
    initialData: [],
  })

  const tokenColorMap = useMemo(() => {
    return Object.fromEntries(
      [
        ...new Set(
          analytics
            .map((item) =>
              item.volumeSnapshots.map(({ address }) => getAddress(address)),
            )
            .flat(),
        ),
      ]
        .sort()
        .map((address, index) => [
          address,
          `hsl(${(index * 137.508) % 360}, 100%, 50%)`,
        ]),
    )
  }, [analytics])

  return (
    <RedirectIfNotMonadTestnetContainer>
      {analytics.length > 0 && (
        <div className="flex flex-col w-full h-full items-center justify-center gap-8 px-16 pb-16">
          <div className="flex w-full h-12 sm:h-[72px] flex-col justify-start items-center gap-2 sm:gap-3">
            <div className="self-stretch text-center text-white text-lg sm:text-4xl font-bold">
              Monad Testnet Analytics
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-col flex-1">
              <div className="text-white text-sm md:text-base font-bold">
                Daily Active Users
              </div>

              <div className="flex w-[350px] sm:w-[500px]">
                <HistogramChart
                  data={analytics.map((item) => ({
                    time: item.timestamp as UTCTimestamp,
                    values: { User: item.googleAnalyticsActiveUsers },
                  }))}
                  totalKey={'User'}
                  colors={['#4C82FB']}
                  detailData={[{ label: 'User', color: '#4C82FB' }]}
                  height={312}
                />
              </div>
            </div>

            <div className="flex flex-col flex-1">
              <div className="text-white text-sm md:text-base font-bold">
                Daily Volume
              </div>

              <div className="flex w-[350px] sm:w-[500px]">
                <HistogramChart
                  prefix={'$'}
                  data={analytics.map((item) => ({
                    time: item.timestamp as UTCTimestamp,
                    values: {
                      ...Object.fromEntries(
                        item.volumeSnapshots.map(({ symbol, amount }) => [
                          symbol,
                          amount,
                        ]),
                      ),
                      TotalUSD: item.volumeSnapshots.reduce(
                        (sum, { amount, address }) =>
                          sum + (prices[address] ?? 0) * amount,
                        0,
                      ),
                    },
                  }))}
                  totalKey={'TotalUSD'}
                  colors={[...Object.values(tokenColorMap), '#4C82FB'].sort()}
                  detailData={
                    Object.entries(tokenColorMap)
                      .map(([address, color]) => ({
                        label: whitelistCurrencies.find((currency) =>
                          isAddressEqual(
                            currency.address,
                            address as `0x${string}`,
                          ),
                        )?.symbol,
                        color,
                      }))
                      .filter(({ label }) => label) as {
                      label: string
                      color: string
                    }[]
                  }
                  height={312}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-col flex-1">
              <div className="text-white text-sm md:text-base font-bold">
                Daily Active Wallets
              </div>

              <div className="flex w-[350px] sm:w-[500px]">
                <HistogramChart
                  data={analytics.map((item) => ({
                    time: item.timestamp as UTCTimestamp,
                    values: { Wallet: item.walletCount },
                  }))}
                  totalKey={'Wallet'}
                  colors={['#A457FF']}
                  detailData={[{ label: 'Wallet', color: '#A457FF' }]}
                  height={312}
                />
              </div>
            </div>

            <div className="flex flex-col flex-1">
              <div className="text-white text-sm md:text-base font-bold">
                Daily Transactions
              </div>

              <div className="flex w-[350px] sm:w-[500px]">
                <HistogramChart
                  data={analytics.map((item) => ({
                    time: item.timestamp as UTCTimestamp,
                    values: { Transaction: item.transactionCount },
                  }))}
                  totalKey={'Transaction'}
                  colors={['#FC72FF']}
                  detailData={[{ label: 'Transaction', color: '#FC72FF' }]}
                  height={312}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </RedirectIfNotMonadTestnetContainer>
  )
}
