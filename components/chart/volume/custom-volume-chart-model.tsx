import { DeepPartial, ISeriesApi } from 'lightweight-charts'

import { ChartModel, ChartModelParams } from '../chart-model'

import { CustomHistogramData, CustomHistogramSeriesOptions } from './renderer'
import { CrosshairHighlightPrimitive } from './crosshair-highlight-primitive'
import { CustomHistogramSeries } from './custom-histogram-series'

export type CustomVolumeChartModelParams = {
  colors: { label: string; color: string }[]
  headerHeight: number
  useThinCrosshair?: boolean
  background?: string
}

// Custom volume chart model, uses stacked volume chart as base model
// Extensible to other volume charts (i.e. see VolumeChartModel for single-histogram volume chart implementation)
export class CustomVolumeChartModel<
  TDataType extends CustomHistogramData,
> extends ChartModel<TDataType> {
  protected series: ISeriesApi<'Custom'>
  private highlightBarPrimitive?: CrosshairHighlightPrimitive
  private hoveredXPos: number | undefined

  constructor(
    chartDiv: HTMLDivElement,
    params: ChartModelParams<TDataType> & CustomVolumeChartModelParams,
  ) {
    super(chartDiv, params)

    this.series = this.api.addCustomSeries(
      new CustomHistogramSeries({
        colors: params.colors,
        background: params.background,
      }),
    )

    this.series.setData(this.data)

    // Add crosshair highlight bar
    this.highlightBarPrimitive = new CrosshairHighlightPrimitive({
      color: 'rgba(34,34,34,0.05)',
      crosshairYPosition: params.headerHeight,
      useThinCrosshair: params.useThinCrosshair,
    })
    this.series.attachPrimitive(this.highlightBarPrimitive)

    this.updateOptions(params)
    this.fitContent()

    this.api.subscribeCrosshairMove((param) => {
      if (param?.point?.x !== this.hoveredXPos) {
        this.hoveredXPos = param?.point?.x
        this.series.applyOptions({
          hoveredXPos: this.hoveredXPos ?? -1, // -1 is used because series will use prev value if undefined is passed
        } as DeepPartial<CustomHistogramSeriesOptions>)
      }
    })
  }

  updateOptions(
    params: ChartModelParams<TDataType> & CustomVolumeChartModelParams,
    options?: any,
  ) {
    // Use stacked volume chart set-up options as default base options
    const stackedVolumeChartOptions = {
      rightPriceScale: {
        visible: false,
      },
      handleScale: false,
      handleScroll: false,
      crosshair: {
        horzLine: {
          visible: false,
          labelVisible: false,
        },
        vertLine: {
          visible: false,
          labelVisible: false,
        },
      },
      ...options,
    }

    super.updateOptions(params, stackedVolumeChartOptions)
    const { data } = params

    // Handles changes in data, e.g. time period selection
    if (this.data !== data) {
      this.data = data
      this.series.setData(data)
      this.fitContent()
    }

    this.series.applyOptions({
      priceFormat: {
        type: 'volume',
      },
      priceLineVisible: false,
      lastValueVisible: false,
    })

    this.series.priceScale().applyOptions({
      scaleMargins: {
        top: 0.3,
        bottom: 0,
      },
    })
  }
}
