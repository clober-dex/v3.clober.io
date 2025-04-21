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

      {analytics.length === 0 && (
        <div
          role="status"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-24 lg:mt-0"
        >
          <svg
            aria-hidden="true"
            className="w-8 h-8 animate-spin text-gray-600 fill-blue-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
        </div>
      )}
    </RedirectIfNotMonadTestnetContainer>
  )
}
