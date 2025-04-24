/**
 * Copied and modified from: https://github.com/Uniswap/interface/tree/main/apps/web/src/components/Charts/StackedLineChart
 * Modifications are called out with comments.
 */

import {
  CustomStyleOptions,
  DeepPartial,
  ISeriesApi,
  Logical,
  UTCTimestamp,
  WhitespaceData,
} from 'lightweight-charts'

import { ChartModel, ChartModelParams } from './chart-model'
import { StackedAreaSeriesOptions } from './stacked/area/stacked-area-options'
import { StackedAreaSeries } from './stacked/area/stacked-area-series'

export interface StackedLineData extends WhitespaceData<UTCTimestamp> {
  values: number[]
}

interface TVLChartParams extends ChartModelParams<StackedLineData> {
  colors: string[]
  yMultiplier?: number
  gradients?: { start: string; end: string }[]
}

export class TVLChartModel extends ChartModel<StackedLineData> {
  protected series: ISeriesApi<'Custom'>

  private hoveredLogicalIndex: Logical | null | undefined

  constructor(chartDiv: HTMLDivElement, params: TVLChartParams) {
    super(chartDiv, params)

    this.series = this.api.addCustomSeries(
      new StackedAreaSeries({ yMultiplier: params.yMultiplier }),
      {} as DeepPartial<CustomStyleOptions>,
    )

    this.series.setData(this.data)
    this.updateOptions(params)
    this.fitContent()

    this.api.subscribeCrosshairMove((param) => {
      if (param?.logical !== this.hoveredLogicalIndex) {
        this.hoveredLogicalIndex = param?.logical
        this.series.applyOptions({
          hoveredLogicalIndex: this.hoveredLogicalIndex ?? (-1 as Logical), // -1 is used because series will use prev value if undefined is passed
        } as DeepPartial<StackedAreaSeriesOptions>)
      }
    })
  }

  updateOptions(params: TVLChartParams) {
    const isSingleLineChart = params.colors.length === 1

    const gridSettings = isSingleLineChart
      ? {
          grid: {
            vertLines: { style: 5, color: '#BFBFBF' },
            horzLines: { style: 5, color: '#BFBFBF' },
          },
        }
      : {}

    super.updateOptions(params, {
      handleScale: false,
      handleScroll: false,
      rightPriceScale: {
        visible: isSingleLineChart, // Hide pricescale on multi-line charts
        borderVisible: false,
        scaleMargins: {
          top: 0.55,
          bottom: 0,
        },
        autoScale: true,
      },
      ...gridSettings,
    })
    const { data, colors, gradients } = params

    // Handles changes in data, e.g. time period selection
    if (this.data !== data) {
      this.data = data
      this.series.setData(data)
      this.fitContent()
    }

    this.series.applyOptions({
      priceLineVisible: false,
      lastValueVisible: false,
      colors,
      gradients,
      lineWidth: 2.5,
      priceTicks: [
        0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4, 1.5,
        1.6, 1.7, 1.8, 1.9, 2, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3,
        3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9,
      ] as number[],
    } as DeepPartial<StackedAreaSeriesOptions>)
  }
}
