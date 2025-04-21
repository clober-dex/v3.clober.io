import React, { useMemo } from 'react'
import { TamaguiProvider } from '@tamagui/web'

import tamaguiConfig from '../../tamagui.config'
import { toHumanReadableString } from '../../utils/number'

import { Chart } from './chart-model'
import { CustomVolumeChartModel } from './volume/custom-volume-chart-model'
import { StackedHistogramData } from './volume/renderer'
import { ChartHeader } from './chart-header'

export const HistogramChart = ({
  data,
  totalKey,
  colors,
  detailData,
  height,
  prefix,
}: {
  data: StackedHistogramData[]
  totalKey: string
  colors: string[]
  detailData: { label: string; color: string }[]
  height: number
  prefix?: string
}) => {
  const params = {
    data,
    colors,
    background: '#FFFFFF',
  }
  const last = useMemo(
    () =>
      data[
        data.length > 2
          ? data.length - 2
          : data.length > 1
            ? data.length - 1
            : 0
      ].values[totalKey as keyof StackedHistogramData['values']] ?? 0,
    [data, totalKey],
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
            Model={CustomVolumeChartModel<StackedHistogramData>}
            params={params as any}
            height={height}
          >
            {(crosshairData) => {
              return (
                <ChartHeader
                  value={`${prefix ?? ''}${
                    crosshairData
                      ? toHumanReadableString(
                          crosshairData.values[totalKey] ?? 0,
                        )
                      : toHumanReadableString(last)
                  }`}
                  time={crosshairData?.time}
                  detailData={
                    crosshairData
                      ? detailData
                          .map(({ label, color }) => ({
                            label,
                            value: `${prefix ?? ''}${toHumanReadableString(
                              crosshairData.values[label] ?? 0,
                            )}`,
                            color,
                          }))
                          .sort(
                            (a, b) =>
                              (crosshairData.values[a.label] ?? 0) -
                              (crosshairData.values[b.label] ?? 0),
                          )
                      : []
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
