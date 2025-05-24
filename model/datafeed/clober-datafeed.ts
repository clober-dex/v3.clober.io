import { CHAIN_IDS, getChartLogs, getLatestChartLog } from '@clober/v2-sdk'
import {
  setIntervalAsync,
  SetIntervalAsyncTimer,
} from 'set-interval-async/fixed'

import {
  Bar,
  DatafeedConfiguration,
  HistoryCallback,
  IBasicDataFeed,
  LibrarySymbolInfo,
  OnReadyCallback,
  PeriodParams,
  ResolutionString,
  ResolveCallback,
  SearchSymbolsCallback,
  SubscribeBarsCallback,
} from '../../public/static/charting_library'
import { Currency } from '../currency'
import { SUPPORTED_INTERVALS } from '../../utils/chart'
import { getPriceDecimals } from '../../utils/prices'
import { CHAIN_CONFIG } from '../../chain-configs'

const CONFIGURATION_DATA: Partial<DatafeedConfiguration> &
  Required<
    Pick<
      DatafeedConfiguration,
      'supported_resolutions' | 'exchanges' | 'symbols_types'
    >
  > = {
  supported_resolutions: SUPPORTED_INTERVALS.map(
    (interval) => interval[0],
  ) as ResolutionString[],
  exchanges: [
    {
      value: CHAIN_CONFIG.DEX_NAME,
      name: CHAIN_CONFIG.DEX_NAME,
      desc: CHAIN_CONFIG.DEX_NAME,
    },
  ],
  symbols_types: [
    {
      name: 'crypto',
      // `symbolType` argument for the `searchSymbols` method, if a user selects this symbol type
      value: 'crypto',
    },
  ],
}

export default class CloberDatafeed implements IBasicDataFeed {
  private chainId: CHAIN_IDS
  private baseCurrency: Currency
  private quoteCurrency: Currency
  private totalSupply: number
  private subscriber: Record<string, SetIntervalAsyncTimer<[]>> = {}
  private readonly lastBarsCache = new Map<string, Bar>()

  constructor(
    chainId: CHAIN_IDS,
    baseCurrency: Currency,
    quoteCurrency: Currency,
    totalSupply: number,
  ) {
    this.chainId = chainId
    this.baseCurrency = baseCurrency
    this.quoteCurrency = quoteCurrency
    this.totalSupply = totalSupply
  }

  private buildCacheKey = (
    symbol: string,
    resolution: ResolutionString,
    totalSupply: number,
  ) => `${symbol}${resolution}${totalSupply}`

  onReady(callback: OnReadyCallback) {
    console.log('[onReady]: Method call')
    setTimeout(() => callback(CONFIGURATION_DATA))
  }

  async searchSymbols(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    userInput: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    exchange: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    symbolType: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onResult: SearchSymbolsCallback,
  ) {
    console.log('[searchSymbols]: Method call')
  }

  async resolveSymbol(symbolName: string, onResolve: ResolveCallback) {
    console.log('[resolveSymbol]: Method call', symbolName)
    try {
      const { close } = await getLatestChartLog({
        chainId: this.chainId.valueOf(),
        base: this.baseCurrency.address,
        quote: this.quoteCurrency.address,
      })
      if (close === '0') {
        console.error('cannot resolve symbol')
        return
      }
      const priceDecimal =
        getPriceDecimals(Number(close) * this.totalSupply) + 1
      onResolve({
        name: symbolName, // display name for users
        ticker: symbolName,
        full_name: symbolName,
        description: symbolName,
        type: 'crypto',
        session: '24x7',
        timezone: 'Etc/UTC',
        exchange: CHAIN_CONFIG.DEX_NAME,
        minmov: 1,
        pricescale: 10 ** priceDecimal,
        listed_exchange: CHAIN_CONFIG.DEX_NAME,
        has_intraday: true,
        has_daily: true,
        has_weekly_and_monthly: false, // has weekly data
        visible_plots_set: 'ohlcv',
        supported_resolutions: CONFIGURATION_DATA.supported_resolutions,
        volume_precision: 2,
        data_status: 'streaming',
        format: 'price',
      } as LibrarySymbolInfo)
    } catch (error) {
      console.error((error as Error).message)
      await this.resolveSymbol(symbolName, onResolve)
    }
  }

  async getBars(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    periodParams: PeriodParams,
    onResult: HistoryCallback,
  ) {
    const { from, to, firstDataRequest } = periodParams
    console.log('[getBars]: Method call', symbolInfo.name, resolution, from, to)
    if (to === 0) {
      onResult([], {
        noData: true,
      })
      return
    }
    const resolutionKey = (SUPPORTED_INTERVALS.find(
      (interval) => interval[0] === resolution,
    ) || SUPPORTED_INTERVALS[0])[1]

    const chartLogs = (
      await getChartLogs({
        chainId: this.chainId.valueOf(),
        quote: this.quoteCurrency.address,
        base: this.baseCurrency.address,
        intervalType: resolutionKey,
        from,
        to,
      })
    ).filter((v) => Number(v.close) > 0 && Number(v.open) > 0)
    if (chartLogs.length === 0) {
      onResult([], {
        noData: true,
      })
      return
    }

    const bars = chartLogs.map<Bar>((v, index) => ({
      time: Number(v.timestamp) * 1000,
      open:
        Number(index === 0 ? v.open : chartLogs[index - 1].close) *
        this.totalSupply,
      high: Number(v.high) * this.totalSupply,
      low: Number(v.low) * this.totalSupply,
      close: Number(v.close) * this.totalSupply,
      volume: Number(v.volume) * this.totalSupply,
    }))

    if (firstDataRequest) {
      this.lastBarsCache.set(
        this.buildCacheKey(
          symbolInfo.ticker ?? '',
          resolution,
          this.totalSupply,
        ),
        {
          ...bars[bars.length - 1],
        },
      )
    }

    if (bars) {
      onResult(bars, {
        noData: true,
      })
    }
  }

  async subscribeBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    onTick: SubscribeBarsCallback,
    listenerGuid: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onResetCacheNeededCallback: () => void,
  ) {
    if (!symbolInfo.ticker || this.subscriber[listenerGuid]) {
      return
    }
    console.log('[subscribeBars]: Method call', listenerGuid)

    this.subscriber[listenerGuid] = setIntervalAsync(async () => {
      const ticker = symbolInfo.ticker ?? ''
      const { timestamp, close, open, volume, high, low } =
        await getLatestChartLog({
          chainId: this.chainId.valueOf(),
          base: this.baseCurrency.address,
          quote: this.quoteCurrency.address,
        })

      const intervalInNumber = (SUPPORTED_INTERVALS.find(
        (interval) => interval[0] === resolution,
      ) || SUPPORTED_INTERVALS[0])[2]

      // We assume here that the data received will have the same timestamp
      const timestampForAcc =
        Math.floor((timestamp * 1000) / intervalInNumber) * intervalInNumber
      const lastTickBar = this.lastBarsCache.get(
        this.buildCacheKey(ticker, resolution, this.totalSupply),
      )
      const nextTickTime = (lastTickBar?.time || 0) + intervalInNumber
      const bar =
        timestampForAcc >= nextTickTime || !lastTickBar
          ? {
              time: timestamp * 1000,
              open: Number(open) * this.totalSupply,
              high: Number(high) * this.totalSupply,
              low: Number(low) * this.totalSupply,
              close: Number(close) * this.totalSupply,
              volume: Number(volume) * this.totalSupply,
            }
          : {
              time: lastTickBar.time,
              open: lastTickBar.open,
              high: Math.max(
                Number(close) * this.totalSupply,
                lastTickBar.high,
              ),
              low: Math.min(Number(close) * this.totalSupply, lastTickBar.low),
              close: Number(close) * this.totalSupply,
              volume: Number(volume) * this.totalSupply,
            }

      this.lastBarsCache.set(
        this.buildCacheKey(ticker, resolution, this.totalSupply),
        bar,
      )

      if (bar) {
        onTick(bar)
      }

      // onResetCacheNeededCallback()
    }, 2000)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  unsubscribeBars(listenerGuid: string) {}
}
