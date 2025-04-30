import React, { useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { getAddress } from 'viem'

import { useChainContext } from '../contexts/chain-context'
import { fetchVolumeLeaderboard, fetchWalletDayData } from '../apis/leaderboard'
import { DailyActivitySnapshot } from '../model/snapshot'
import { Prices } from '../model/prices'
import { useCurrencyContext } from '../contexts/currency-context'
import { Legend } from '../components/chart/legend'
import { Loading } from '../components/loading'
import { toCommaSeparated } from '../utils/number'
import { useWindowWidth } from '../hooks/useWindowWidth'
import { TradingCompetitionPnl } from '../model/trading-competition-pnl'

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
        <div className="min-w-[800px] sm:min-w-[964px] max-w-[964px] h-full sm:h-[227px] relative bg-[#18212f] rounded-3xl p-4 sm:p-6 mx-auto">
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
      [user: `0x${string}`]: TradingCompetitionPnl
    }
  }
  console.log('leaderboard', allUserVolume)

  return (
    <div className="w-full flex items-center flex-col text-white mb-4 mt-2 px-4">
      <Heatmap userDailyVolumes={userDailyVolumes} prices={prices} />
    </div>
  )
}
