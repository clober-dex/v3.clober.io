import React, { useMemo } from 'react'
import { TamaguiProvider } from '@tamagui/web'

import { Chart } from '../../components/chart/chart-model'
import tamaguiConfig from '../../tamagui.config'
import { ChartHeader } from '../../components/chart/chart-header'
import { PoolPerformanceChartModel } from '../../components/chart/pool-performance-chart-model'

export const PoolChartContainer = ({
  historicalPriceIndex,
  showRPI,
}: {
  historicalPriceIndex: { timestamp: number; pi: number; rpi: number }[]
  showRPI: boolean
}) => {
  const lastEntry = historicalPriceIndex[historicalPriceIndex.length - 1]
  const params = useMemo(
    () => ({
      data: historicalPriceIndex.map(({ timestamp, rpi, pi }) => ({
        time: timestamp,
        values: showRPI ? [rpi, 0] : [pi, 0],
      })),
      colors: ['#4C82FB', '#FC72FF'],
      yMultiplier: 1,
      gradients: [
        {
          start: 'rgba(96, 123, 238, 0.20)',
          end: 'rgba(55, 70, 136, 0.00)',
        },
        {
          start: 'rgba(252, 116, 254, 0.20)',
          end: 'rgba(252, 116, 254, 0.00)',
        },
      ],
    }),
    [showRPI, historicalPriceIndex],
  )

  return (
    <TamaguiProvider
      config={tamaguiConfig}
      disableInjectCSS
      disableRootThemeClass
    >
      {(() => {
        return (
          <Chart
            Model={PoolPerformanceChartModel}
            params={params as any}
            height={368}
          >
            {(crosshairData) => {
              const value = crosshairData
                ? crosshairData.values[0]
                : showRPI
                  ? (lastEntry?.rpi ?? 0)
                  : (lastEntry?.pi ?? 0)
              return (
                <ChartHeader
                  value={`${value.toFixed(4)}`}
                  time={crosshairData?.time as any}
                  detailData={
                    showRPI
                      ? [
                          {
                            label: 'RPI',
                            color: '#FC72FF',
                            value: `${(
                              (crosshairData as any)?.values[0] ?? 0
                            ).toFixed(4)}`,
                          },
                        ]
                      : [
                          {
                            label: 'PI',
                            color: '#4C82FB',
                            value: `${(
                              (crosshairData as any)?.values[0] ?? 0
                            ).toFixed(4)}`,
                          },
                        ]
                  }
                />
              )
            }}
          </Chart>
        )
      })()}
    </TamaguiProvider>
  )
}
