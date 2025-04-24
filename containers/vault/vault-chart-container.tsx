import React, { useMemo } from 'react'
import { TamaguiProvider } from '@tamagui/web'

import { Chart } from '../../components/chart/chart-model'
import tamaguiConfig from '../../tamagui.config'
import { ChartHeader } from '../../components/chart/chart-header'
import {
  StackedLineData,
  VaultPerformanceChartModel,
} from '../../components/chart/vault-performance-chart-model'

export const VaultChartContainer = ({
  historicalPriceIndex,
  showPnL,
}: {
  historicalPriceIndex: StackedLineData[]
  showPnL: boolean
}) => {
  const lastEntry = historicalPriceIndex[historicalPriceIndex.length - 1]
  const params = useMemo(
    () => ({
      data: historicalPriceIndex.map((entry) => ({
        time: entry.time,
        values: showPnL ? [entry.values[1], 0] : [entry.values[0], 0],
      })),
      colors: ['#4C82FB', '#FC72FF'],
      yMultiplier: 1000,
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
    [showPnL, historicalPriceIndex],
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
            Model={VaultPerformanceChartModel}
            params={params as any}
            height={368}
          >
            {(crosshairData) => {
              const value = crosshairData
                ? crosshairData.values[0]
                : (lastEntry?.values[showPnL ? 1 : 0] ?? 0)
              return (
                <ChartHeader
                  value={`${value.toFixed(4)}`}
                  time={crosshairData?.time as any}
                  detailData={
                    showPnL
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
