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
  colors,
  height,
  defaultValue,
  prefix,
}: {
  data: StackedHistogramData[]
  colors: { label: string; color: string }[]
  height: number
  defaultValue?: number
  prefix?: string
}) => {
  const params = {
    data,
    colors,
    background: '#FFFFFF',
  }
  const last = useMemo(
    () =>
      Object.values(
        data[
          data.length > 2
            ? data.length - 2
            : data.length > 1
              ? data.length - 1
              : 0
        ].values ?? {},
      ).reduce((acc: number, value) => acc + (value ?? 0), 0),
    [data],
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
              const total = Object.values(crosshairData?.values ?? {}).reduce(
                (acc: number, value) => acc + (value ?? 0),
                0,
              )
              return (
                <ChartHeader
                  value={`${prefix ?? ''}${
                    crosshairData && crosshairData.values
                      ? toHumanReadableString(total)
                      : toHumanReadableString(defaultValue ?? last)
                  }`}
                  time={crosshairData?.time}
                  detailData={
                    crosshairData
                      ? (colors
                          .map(({ label, color }) => ({
                            label,
                            value: crosshairData.values[label]
                              ? `${prefix ?? ''}${toHumanReadableString(
                                  crosshairData.values[label]!,
                                )}`
                              : undefined,
                            color,
                          }))
                          .filter(({ value }) => value !== undefined)
                          .sort(
                            (a, b) =>
                              (crosshairData.values[b.label] ?? 0) -
                              (crosshairData.values[a.label] ?? 0),
                          ) as any)
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
