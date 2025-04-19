import React, { useMemo } from 'react'
import { useRouter } from 'next/router'

import { currentTimestampInSeconds } from '../../utils/date'
import { CurrencyIcon } from '../../components/icon/currency-icon'
import { useChainContext } from '../../contexts/chain-context'
import { VaultImmutableInfo } from '../../model/vault'

export const VaultDashboardContainer = ({
  vaultImmutableInfo,
}: {
  vaultImmutableInfo: VaultImmutableInfo
}) => {
  const router = useRouter()
  const { selectedChain } = useChainContext()
  const [now, hourAgo, sixHourAgo] = useMemo(() => {
    const now = currentTimestampInSeconds() * 1000
    return [now, now - 60 * 60 * 1000, now - 6 * 60 * 60 * 1000]
  }, [])

  return (
    <div className="flex w-full h-full justify-center mt-8 mb-[30px] md:mb-20">
      <div className="w-full lg:w-[992px] h-full flex flex-col items-start gap-8 md:gap-12 px-4 lg:px-0">
        <div className="flex w-full h-full items-center">
          <button
            onClick={() => router.push('/earn')}
            className="flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
              fill="none"
              className="mr-auto w-6 h-6 md:w-8 md:h-8"
            >
              <path
                d="M6.66699 16.0003H25.3337M6.66699 16.0003L12.0003 21.3337M6.66699 16.0003L12.0003 10.667"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="flex w-full items-center justify-center">
            <div className="flex items-center justify-center relative w-full h-full gap-2 md:gap-4">
              <div className="w-10 h-6 md:w-14 md:h-8 shrink-0 relative">
                <CurrencyIcon
                  chain={selectedChain}
                  currency={vaultImmutableInfo.currencyB}
                  className="w-6 h-6 md:w-8 md:h-8 absolute left-0 top-0 z-[1] rounded-full"
                />
                <CurrencyIcon
                  chain={selectedChain}
                  currency={vaultImmutableInfo.currencyA}
                  className="w-6 h-6 md:w-8 md:h-8 absolute left-4 md:left-6 top-0 rounded-full"
                />
              </div>

              <div className="flex justify-center items-start gap-1 md:gap-2">
                <div className="text-center text-white md:text-3xl font-bold">
                  {vaultImmutableInfo.currencyB.symbol}
                </div>
                <div className="text-center text-white md:text-3xl font-bold">
                  -
                </div>
                <div className="text-center text-white md:text-3xl font-bold">
                  {vaultImmutableInfo.currencyA.symbol}
                </div>
              </div>

              {vaultImmutableInfo.hasDashboard && (
                <button
                  onClick={() =>
                    vaultImmutableInfo.hasDashboard
                      ? router.push(`/earn/${vaultImmutableInfo.key}`)
                      : router.push(`/earn/${vaultImmutableInfo.key}/dashboard`)
                  }
                  className="hidden lg:flex w-fit h-8 px-3 py-2 bg-blue-500 rounded-lg justify-center items-center gap-1"
                  rel="noreferrer"
                >
                  <div className="grow shrink basis-0 opacity-90 text-center text-white text-sm font-bold">
                    {vaultImmutableInfo.hasDashboard
                      ? 'Add Liquidity'
                      : 'Dashboard'}
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
        {vaultImmutableInfo.key.toLowerCase() ===
        '0xc8cbe608c82ee9c4c30f01d7c0eefd977538ac396ed34430aa3993bfe0d363ae' ? (
          <div className="flex flex-col gap-2 w-full">
            <iframe
              src={`https://mm.clober.io/d-solo/dduzjbo4k05j4b/clober-market-making?orgId=1&panelId=3&from=${hourAgo}&to=${now}&theme=dark`}
              width="1115"
              height="400"
              frameBorder="0"
            />

            <div className="flex flex-row gap-2 w-[1200px]">
              <div className="flex flex-col gap-2">
                <iframe
                  src={`https://mm.clober.io/d-solo/decq277ym7apse/8459b0b4-5466-5cf1-bb28-2568c6603344?orgId=1&panelId=10&from=${sixHourAgo}&to=${now}&theme=dark`}
                  frameBorder="0"
                  width="500"
                  height="250"
                />
                <iframe
                  src={`https://mm.clober.io/d-solo/decq277ym7apse/8459b0b4-5466-5cf1-bb28-2568c6603344?orgId=1&panelId=12&from=${sixHourAgo}&to=${now}&theme=dark`}
                  width="500"
                  height="400"
                  frameBorder="0"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex flex-row gap-2 flex-1">
                  <iframe
                    src={`https://mm.clober.io/d-solo/decq277ym7apse/8459b0b4-5466-5cf1-bb28-2568c6603344?orgId=1&panelId=14&from=${sixHourAgo}&to=${now}&theme=dark`}
                    frameBorder="0"
                    width="300"
                    height="320"
                  />
                  <iframe
                    src={`https://mm.clober.io/d-solo/decq277ym7apse/8459b0b4-5466-5cf1-bb28-2568c6603344?orgId=1&panelId=15&from=${sixHourAgo}&to=${now}&theme=dark`}
                    frameBorder="0"
                    width="300"
                    height="320"
                  />
                </div>

                <div className="flex flex-row gap-2 flex-1">
                  <iframe
                    src={`https://mm.clober.io/d-solo/decq277ym7apse/8459b0b4-5466-5cf1-bb28-2568c6603344?orgId=1&panelId=2&from=${sixHourAgo}&to=${now}&theme=dark`}
                    frameBorder="0"
                    width="300"
                    height="320"
                  />
                  <iframe
                    src={`https://mm.clober.io/d-solo/decq277ym7apse/8459b0b4-5466-5cf1-bb28-2568c6603344?orgId=1&panelId=3&from=${sixHourAgo}&to=${now}&theme=dark`}
                    frameBorder="0"
                    width="300"
                    height="320"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  )
}
