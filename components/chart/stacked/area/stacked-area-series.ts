/* Copied from: https://github.com/tradingview/lightweight-charts/blob/f13a3c1f3fefcace9d4da5b97c1638009298b3c8/plugin-examples/src/plugins/stacked-area-series */
import {
  CustomSeriesPricePlotValues,
  ICustomSeriesPaneView,
  PaneRendererCustomData,
  Time,
  WhitespaceData,
} from 'lightweight-charts'

import { StackedAreaData } from './stacked-area-data'
import { StackedAreaSeriesRenderer } from './stacked-area-series-renderer'
import {
  defaultOptions,
  StackedAreaSeriesOptions,
} from './stacked-area-options'

export class StackedAreaSeries<TData extends StackedAreaData>
  implements ICustomSeriesPaneView<Time, TData, StackedAreaSeriesOptions>
{
  _renderer: StackedAreaSeriesRenderer<TData>

  constructor(
    { yMultiplier = 1 }: { yMultiplier?: number } = {
      yMultiplier: 1,
    },
  ) {
    this._renderer = new StackedAreaSeriesRenderer({ yMultiplier })
  }

  priceValueBuilder(plotRow: TData): CustomSeriesPricePlotValues {
    return [
      0,
      plotRow.values.reduce(
        (previousValue, currentValue) => previousValue + currentValue,
        0,
      ),
    ]
  }

  isWhitespace(data: TData | WhitespaceData): data is WhitespaceData {
    return !(data as Partial<TData>).values?.length
  }

  renderer(): StackedAreaSeriesRenderer<TData> {
    return this._renderer
  }

  update(
    data: PaneRendererCustomData<Time, TData>,
    options: StackedAreaSeriesOptions,
  ): void {
    this._renderer.update(data, options)
  }

  defaultOptions() {
    return defaultOptions
  }
}
