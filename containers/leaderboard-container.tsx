import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { getAddress, isAddressEqual } from 'viem'
import CountUp from 'react-countup'

import { useChainContext } from '../contexts/chain-context'
import {
  fetchUserVolume,
  fetchVolumeLeaderboard,
  fetchWalletDayData,
} from '../apis/leaderboard'
import { DailyActivitySnapshot } from '../model/snapshot'
import { Prices } from '../model/prices'
import { useCurrencyContext } from '../contexts/currency-context'
import { Legend } from '../components/chart/legend'
import { Loading } from '../components/loading'
import { toCommaSeparated } from '../utils/number'
import { useWindowWidth } from '../hooks/useWindowWidth'
import { LeaderBoard } from '../components/leader-board'
import { fetchLiquidVaultPoint } from '../apis/point'

type HeatmapProps = {
  userDailyVolumes: {
    timestamp: number
    volumeSnapshots: DailyActivitySnapshot['volumeSnapshots']
  }[]
  prices: Prices
  monthLabels?: string[]
}

const getColor = (value: number) => {
  if (value >= 6) {
    return 'bg-blue-900'
  }
  if (value >= 5) {
    return 'bg-blue-700'
  }
  if (value >= 4) {
    return 'bg-blue-600'
  }
  if (value >= 3) {
    return 'bg-blue-500'
  }
  if (value >= 2) {
    return 'bg-blue-400'
  }
  if (value >= 1) {
    return 'bg-blue-300'
  }
  return 'bg-[#2b3544]'
}

function getStartOfLastMonth(): Date {
  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  lastMonth.setHours(0, 0, 0, 0)
  return lastMonth
}

function groupSnapshotsByDay(
  data: {
    timestamp: number
    volumeSnapshots: DailyActivitySnapshot['volumeSnapshots']
  }[],
  prices: Prices,
) {
  const grouped: Record<string, { value: number; timestamp: number }> = {}

  for (const entry of data) {
    const date = new Date(entry.timestamp * 1000)
    date.setHours(0, 0, 0, 0)
    const key = date.toISOString()

    const dailyTotal =
      entry.volumeSnapshots?.reduce(
        (sum: number, snapshot: any) =>
          sum +
          (snapshot.amount ?? 0) * (prices[getAddress(snapshot.address)] ?? 0),
        0,
      ) ?? 0

    grouped[key] = {
      value: (grouped[key]?.value ?? 0) + dailyTotal,
      timestamp: entry.timestamp,
    }
  }

  return grouped
}

const getMonthLabels = (): string[] => {
  const labels: string[] = []
  const now = new Date()
  now.setDate(1)
  now.setMonth(now.getMonth() - 1)

  for (let i = 0; i < 8; i++) {
    const month = now.toLocaleString('en-US', { month: 'short' })
    labels.push(month)
    now.setMonth(now.getMonth() + 1)
  }

  return labels
}

function Heatmap({ userDailyVolumes, prices, monthLabels }: HeatmapProps) {
  const width = useWindowWidth()
  const months = monthLabels ?? getMonthLabels()
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [hoverInfo, setHoverInfo] = useState<{
    volumes: { label: string; value: number; address: `0x${string}` }[]
    date: string
    top: number
    left: number
  } | null>(null)

  const heatmapData = useMemo(() => {
    const grouped = groupSnapshotsByDay(userDailyVolumes, prices)
    const start = getStartOfLastMonth()
    const matrix: {
      value: number
      timestamp: number
    }[][] = []

    for (let week = 0; week < 44; week++) {
      const weekData: {
        value: number
        timestamp: number
      }[] = []

      for (let day = 0; day < 7; day++) {
        const current = new Date(start)
        current.setDate(start.getDate() + week * 7 + day)
        const key = current.toISOString()

        weekData.push({
          value: grouped[key]?.value ?? 0,
          timestamp: grouped[key]?.timestamp ?? 0,
        })
      }

      matrix.push(weekData)
    }

    return matrix
  }, [userDailyVolumes, prices])
  const startDate = useMemo(() => getStartOfLastMonth(), [])
  const totalVolume = useMemo(() => {
    return heatmapData.reduce(
      (acc, week) =>
        acc + week.reduce((weekAcc, { value }) => weekAcc + value, 0),
      0,
    )
  }, [heatmapData])
  const tokenColorMap = useMemo(() => {
    const addresses = [
      ...new Set(
        userDailyVolumes.flatMap((item) =>
          item.volumeSnapshots.map(({ address }) => getAddress(address)),
        ),
      ),
    ].sort()

    return Object.fromEntries(
      addresses.map((address, index) => {
        const baseHue = (index * 47) % 360
        const hue = (baseHue + (index % 2) * 180) % 360
        return [address, `hsl(${hue}, 70%, 50%)`]
      }),
    )
  }, [userDailyVolumes])

  return (
    <div ref={containerRef} className="relative w-full">
      <div ref={scrollRef} className="overflow-x-auto">
        <div className="min-w-[800px] sm:min-w-[964px] max-w-[964px] h-[158px] sm:h-[227px] relative bg-[#18212f] rounded-3xl p-4 sm:p-6 mx-auto">
          {totalVolume === 0 && <Loading />}
          <div className="absolute top-0 left-0 w-full h-full rounded-3xl pointer-events-none" />

          <div className="flex gap-[3px] sm:gap-[5px] mt-[24px] sm:mt-[32px]">
            {heatmapData.map((col, colIdx) => (
              <div
                key={colIdx}
                className="w-3 sm:w-4 flex flex-col gap-[3px] sm:gap-[5px]"
              >
                {col.map(({ value, timestamp }, rowIdx) => {
                  const date = new Date(startDate)
                  date.setDate(startDate.getDate() + colIdx * 7 + rowIdx)
                  const dateStr = date.toDateString()
                  const volumeSnapshots = userDailyVolumes.find(
                    (item) => item.timestamp === timestamp,
                  )?.volumeSnapshots

                  return (
                    <div
                      key={rowIdx}
                      className={`${value > 0 ? 'cursor-pointer' : ''} w-3 h-3 sm:w-4 sm:h-4 rounded-sm ${getColor(value)}`}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        const scrollRect =
                          scrollRef.current?.getBoundingClientRect()
                        const containerRect =
                          containerRef.current?.getBoundingClientRect()

                        if (!scrollRect || !containerRect || width < 768) {
                          return
                        }

                        const offsetTop = rect.top - containerRect.top
                        const offsetLeft =
                          rect.left -
                          scrollRect.left +
                          (scrollRef.current?.scrollLeft ?? 0)

                        setHoverInfo({
                          volumes:
                            (volumeSnapshots ?? [])
                              .map(({ symbol, amount, address }) => ({
                                label: symbol,
                                value: amount,
                                address: getAddress(address),
                              }))
                              .filter(({ value }) => value > 0) ?? [],
                          date: dateStr,
                          top: offsetTop + 24,
                          left: offsetLeft + rect.width / 2,
                        })
                      }}
                      onMouseLeave={() => setHoverInfo(null)}
                    />
                  )
                })}
              </div>
            ))}
          </div>

          <div className="absolute top-[16px] sm:top-[24px] left-[16px] sm:left-[23px] flex gap-[60px] sm:gap-[78px] text-[10px] sm:text-sm text-gray-400 font-medium">
            {months.map((month) => (
              <div key={month} className="w-[40px] sm:w-[50px]">
                {month}
              </div>
            ))}
          </div>
        </div>
      </div>

      {hoverInfo &&
        hoverInfo.volumes.reduce((acc, { value }) => acc + value, 0) > 0 && (
          <div
            style={{
              position: 'absolute',
              top: hoverInfo.top,
              left: hoverInfo.left,
              transform: 'translate(-50%, -120%)',
              pointerEvents: 'none',
              zIndex: 50,
            }}
          >
            <Legend
              data={[
                {
                  label: 'Total',
                  color: '#3977db',
                  value: `$${toCommaSeparated(hoverInfo.volumes.reduce((acc, { value }) => acc + value, 0).toFixed(2))}`,
                },
                ...hoverInfo.volumes.map(({ label, value, address }) => ({
                  label,
                  color: tokenColorMap[getAddress(address)] ?? '#ffffff',
                  value: `$${toCommaSeparated(value.toFixed(2))}`,
                })),
              ]}
            />
          </div>
        )}
    </div>
  )
}

export const LeaderboardContainer = () => {
  const { address: userAddress } = useAccount()
  const { prices } = useCurrencyContext()
  const { selectedChain } = useChainContext()

  const { data: myVaultPoint } = useQuery({
    queryKey: ['my-vault-point', selectedChain.id, userAddress],
    queryFn: async () => {
      if (!userAddress) {
        return 0
      }
      return fetchLiquidVaultPoint(selectedChain.id, userAddress)
    },
    initialData: 0,
  })

  const { data: userDailyVolumes } = useQuery({
    queryKey: ['user-daily-volumes', selectedChain.id, userAddress],
    queryFn: async () => {
      if (!userAddress) {
        return []
      }
      return fetchWalletDayData(selectedChain, userAddress)
    },
    initialData: [],
  })

  const { data: allUserVolume } = useQuery({
    queryKey: ['volume-leaderboard', selectedChain.id],
    queryFn: async () => {
      return fetchVolumeLeaderboard(selectedChain.id)
    },
  }) as {
    data: {
      address: `0x${string}`
      totalVolumeUsd: number
    }[]
  }

  const { data: userVolume } = useQuery({
    queryKey: ['user-volume', selectedChain.id, userAddress],
    queryFn: async () => {
      if (!userAddress) {
        return null
      }
      return fetchUserVolume(selectedChain.id, userAddress)
    },
  }) as {
    data: {
      address: `0x${string}`
      rank: number
      totalVolumeUsd: number
    } | null
  }

  const myRank = useMemo(() => {
    if (allUserVolume && userAddress && userVolume) {
      const index = allUserVolume.findIndex(({ address }) =>
        isAddressEqual(getAddress(address), userAddress),
      )
      return index === -1 ? userVolume.rank : index + 1
    }
    return 0
  }, [allUserVolume, userAddress, userVolume])

  const countUpFormatter = useCallback((value: number): string => {
    return toCommaSeparated(value.toFixed(2))
  }, [])

  return (
    <div className="w-full flex items-center flex-col text-white mb-4 px-4 gap-8">
      <div className="w-full lg:w-[960px] flex flex-col sm:gap-12 items-center">
        <div className="flex w-full h-20 mt-6 sm:mt-0 sm:h-28 px-4 justify-start items-center gap-3 sm:gap-4">
          <div className="grow shrink basis-0 h-full px-6 py-4 sm:px-8 sm:py-6 bg-[rgba(96,165,250,0.10)] rounded-xl sm:rounded-2xl flex-col justify-center items-center gap-3 inline-flex bg-gray-800">
            <div className="text-center text-gray-400 text-sm sm:text-base font-semibold">
              Liquidity Point
            </div>
            <div className="self-stretch text-center text-white text-lg sm:text-2xl font-bold">
              <CountUp
                end={myVaultPoint}
                formattingFn={countUpFormatter}
                preserveValue
                useEasing={false}
                duration={0.5}
              />
            </div>
          </div>
          <div className="grow shrink basis-0 h-full px-6 py-4 sm:px-8 sm:py-6 bg-[rgba(96,165,250,0.10)] rounded-xl sm:rounded-2xl flex-col justify-center items-center gap-3 inline-flex bg-gray-800">
            <div className="text-center text-gray-400 text-sm sm:text-base font-semibold">
              Volume Point
            </div>
            <div className="self-stretch text-center text-white text-lg sm:text-2xl font-bold">
              <CountUp
                end={userVolume ? userVolume.totalVolumeUsd / 1000 : 0}
                formattingFn={countUpFormatter}
                preserveValue
                useEasing={false}
                duration={0.5}
              />
            </div>
          </div>
        </div>
      </div>

      <Heatmap userDailyVolumes={userDailyVolumes} prices={prices} />

      <div className="w-full md:flex md:justify-center relative">
        <div className="flex flex-col items-center gap-3 sm:gap-4 mt-12 mb-4 md:w-[616px]">
          <div className="w-full justify-start text-white text-sm sm:text-lg font-bold text-center sm:text-left">
            Leaderboard
          </div>

          <div className="w-full py-3 sm:py-4 bg-[#1d1f27] sm:bg-[#1c1e27] rounded-xl inline-flex flex-col justify-start items-start gap-3">
            <div className="self-stretch px-4 sm:px-8 inline-flex justify-start items-start gap-1.5 sm:text-sm text-xs">
              <div className="w-16 flex justify-start items-center gap-2.5 text-gray-400">
                Rank
              </div>
              <div className="flex w-full">
                <div className="flex flex-1 justify-start items-center gap-2.5">
                  <div className="justify-start text-gray-400">User</div>
                </div>
                <div className="flex flex-1 justify-start items-center gap-2.5">
                  <div className="justify-start text-gray-400">
                    Total Volume
                  </div>
                </div>
              </div>
            </div>
          </div>

          {allUserVolume ? (
            <LeaderBoard
              explorerUrl={selectedChain.blockExplorers?.default.url ?? ''}
              myValue={
                userAddress
                  ? userVolume
                    ? {
                        address: userAddress,
                        rank: myRank,
                        value: `$${toCommaSeparated(userVolume.totalVolumeUsd.toFixed(2))}`,
                      }
                    : {
                        address: userAddress,
                        rank: -1,
                        value: `$0.00`,
                      }
                  : undefined
              }
              values={allUserVolume.map(
                ({ address, totalVolumeUsd }, index) => ({
                  address: getAddress(address),
                  value: `$${toCommaSeparated(totalVolumeUsd.toFixed(2))}`,
                  rank: index + 1,
                }),
              )}
              maxDisplayRank={1000}
            />
          ) : (
            <Loading />
          )}
        </div>
      </div>
    </div>
  )
}
