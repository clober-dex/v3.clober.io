import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPublicClient, http } from 'viem'
import { useQuery } from '@tanstack/react-query'
import { Tooltip } from 'react-tooltip'
import { FixedSizeGrid as Grid, FixedSizeList as List } from 'react-window'

import { MarketCard } from '../components/card/market-card'
import { useChainContext } from '../contexts/chain-context'
import { SearchSvg } from '../components/svg/search-svg'
import { fetchAllMarkets } from '../apis/market'
import { useCurrencyContext } from '../contexts/currency-context'
import { QuestionMarkSvg } from '../components/svg/question-mark-svg'
import { TriangleDownSvg } from '../components/svg/triangle-down-svg'
import { Market } from '../model/market'
import { useTransactionContext } from '../contexts/transaction-context'
import { Chain } from '../model/chain'
import { Loading } from '../components/loading'
import { CHAIN_CONFIG } from '../chain-configs'

const MOBILE_ROW_HEIGHT = 168

type Column =
  | 'market'
  | 'age'
  | 'price'
  | 'daily-volume'
  | 'fdv'
  | 'daily-change'
  | 'verified'

type SortOption =
  | 'none'
  | 'market-desc'
  | 'market-asc'
  | 'age-desc'
  | 'age-asc'
  | 'price-desc'
  | 'price-asc'
  | 'daily-volume-desc'
  | 'daily-volume-asc'
  | 'fdv-desc'
  | 'fdv-asc'
  | 'daily-change-desc'
  | 'daily-change-asc'
  | 'verified-desc'
  | 'verified-asc'

const TriangleDown = ({
  column,
  sortOption,
}: {
  column: Column
  sortOption: SortOption
}) => {
  return sortOption === `${column}-asc` ? (
    <TriangleDownSvg className="rotate-180" />
  ) : sortOption === `${column}-desc` ? (
    <TriangleDownSvg />
  ) : (
    <></>
  )
}

const LOCAL_STORAGE_MARKET_KEY = (chain: Chain) => `markets-${chain.id}`

export const DiscoverContainer = () => {
  const { selectedChain } = useChainContext()
  const { whitelistCurrencies, prices } = useCurrencyContext()
  const { latestSubgraphBlockNumber } = useTransactionContext()
  const publicClient = useMemo(() => {
    return createPublicClient({
      chain: selectedChain,
      transport: http(CHAIN_CONFIG.RPC_URL),
    })
  }, [selectedChain])
  const prevMarkets = useRef<Market[]>([])
  const prevSubgraphBlockNumber = useRef<number>(0)

  const [searchValue, setSearchValue] = React.useState('')
  const [sortOption, setSortOption] = useState<SortOption>('none')

  useEffect(() => {
    const storedMarkets = localStorage.getItem(
      LOCAL_STORAGE_MARKET_KEY(selectedChain),
    )
    if (storedMarkets) {
      prevMarkets.current = JSON.parse(storedMarkets)
    }
  }, [selectedChain])

  const { data: markets } = useQuery({
    queryKey: ['markets', selectedChain.id],
    queryFn: async () => {
      if (latestSubgraphBlockNumber.blockNumber === 0) {
        return [] as Market[]
      }
      if (
        prevSubgraphBlockNumber.current !==
        latestSubgraphBlockNumber.blockNumber
      ) {
        const markets = await fetchAllMarkets(
          publicClient,
          selectedChain,
          prices,
          whitelistCurrencies.map((currency) => currency.address),
          prevMarkets.current,
        )
        prevMarkets.current = markets
        prevSubgraphBlockNumber.current = latestSubgraphBlockNumber.blockNumber
        localStorage.setItem(
          LOCAL_STORAGE_MARKET_KEY(selectedChain),
          JSON.stringify(markets),
        )
        return markets
      }
      return prevMarkets.current
    },
    refetchInterval: 1000, // checked
    refetchIntervalInBackground: true,
  })

  const filteredMarkets = useMemo(() => {
    return (markets ?? prevMarkets.current ?? [])
      .filter(
        (market) =>
          market.baseCurrency.symbol
            .toLowerCase()
            .includes(searchValue.toLowerCase()) ||
          market.quoteCurrency.symbol
            .toLowerCase()
            .includes(searchValue.toLowerCase()) ||
          market.baseCurrency.name
            .toLowerCase()
            .includes(searchValue.toLowerCase()) ||
          market.quoteCurrency.name
            .toLowerCase()
            .includes(searchValue.toLowerCase()) ||
          market.baseCurrency.address
            .toLowerCase()
            .includes(searchValue.toLowerCase()) ||
          market.quoteCurrency.address
            .toLowerCase()
            .includes(searchValue.toLowerCase()) ||
          `${market.baseCurrency.name}${market.quoteCurrency.name}`
            .toLowerCase()
            .includes(searchValue.toLowerCase()) ||
          `${market.baseCurrency.symbol}${market.quoteCurrency.symbol}`
            .toLowerCase()
            .includes(searchValue.toLowerCase()),
      )
      .sort((a, b) => {
        if (sortOption === 'none') {
          return (
            b.dailyVolume - a.dailyVolume || b.liquidityUsd - a.liquidityUsd
          )
        } else if (sortOption === 'market-asc') {
          return a.baseCurrency.symbol.localeCompare(b.baseCurrency.symbol)
        } else if (sortOption === 'market-desc') {
          return b.baseCurrency.symbol.localeCompare(a.baseCurrency.symbol)
        } else if (sortOption === 'age-asc') {
          return a.createAt - b.createAt
        } else if (sortOption === 'age-desc') {
          return b.createAt - a.createAt
        } else if (sortOption === 'price-asc') {
          return a.price - b.price
        } else if (sortOption === 'price-desc') {
          return b.price - a.price
        } else if (sortOption === 'daily-volume-asc') {
          return a.dailyVolume - b.dailyVolume
        } else if (sortOption === 'daily-volume-desc') {
          return b.dailyVolume - a.dailyVolume
        } else if (sortOption === 'fdv-asc') {
          return a.fdv - b.fdv
        } else if (sortOption === 'fdv-desc') {
          return b.fdv - a.fdv
        } else if (sortOption === 'daily-change-asc') {
          return a.dailyChange - b.dailyChange
        } else if (sortOption === 'daily-change-desc') {
          return b.dailyChange - a.dailyChange
        } else if (sortOption === 'verified-asc') {
          return a.verified ? -1 : 1
        } else if (sortOption === 'verified-desc') {
          return b.verified ? -1 : 1
        }
        return 0
      })
  }, [markets, searchValue, sortOption])

  const sort = useCallback(
    (column: Column) => {
      if (sortOption === 'none') {
        setSortOption(`${column}-desc` as SortOption)
      } else if (sortOption === `${column}-desc`) {
        setSortOption(`${column}-asc` as SortOption)
      } else if (sortOption === `${column}-asc`) {
        setSortOption(`${column}-desc` as SortOption)
      } else {
        setSortOption(`${column}-desc` as SortOption)
      }
    },
    [sortOption],
  )

  const MarketGridCell = ({ columnIndex, rowIndex, style }: any) => {
    const index = rowIndex + columnIndex
    const market = filteredMarkets[index]
    if (!market) {
      return null
    }

    return (
      <div style={style}>
        <MarketCard {...market} chain={selectedChain} />
      </div>
    )
  }

  const MarketListRow = ({
    index,
    style,
  }: {
    index: number
    style: React.CSSProperties
  }) => {
    const market = filteredMarkets[index]
    if (!market) {
      return null
    }

    return (
      <div style={style}>
        <MarketCard {...market} chain={selectedChain} />
      </div>
    )
  }

  return (
    <div className="text-white mb-4 flex w-full lg:w-[1072px]  flex-col items-center mt-6 lg:mt-8 px-4 lg:px-0 gap-4 lg:gap-8">
      <div className="flex max-w-[480px] lg:max-w-full mr-auto w-full lg:w-[432px] flex-col relative rounded shadow-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <div className="relative h-4 w-4">
            <SearchSvg />
          </div>
        </div>
        <div className="inline-block">
          <div className="invisible h-0 mx-[29px]" aria-hidden="true">
            Search by markets
          </div>
          <input
            type="search"
            name="discover-search"
            id="search"
            autoComplete="off"
            className="inline w-full pl-10 py-2 lg:py-3 text-white bg-gray-800 rounded-xl border border-solid border-gray-400 focus:ring-1 focus:ring-inset focus:ring-gray-400 flex-col placeholder:text-gray-400 text-xs sm:text-sm"
            placeholder="Search markets"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col w-full h-full gap-6">
        <div className="hidden lg:flex self-stretch px-4 justify-start items-center gap-4">
          <button
            onClick={() => sort('market')}
            className="w-[330px] flex items-center gap-1 text-sm font-semibold hover:underline cursor-pointer"
          >
            Market
            <TriangleDown column="market" sortOption={sortOption} />
          </button>
          <button
            onClick={() => sort('age')}
            className="w-[180px] flex items-center gap-1 text-sm font-semibold hover:underline cursor-pointer"
          >
            Age
            <TriangleDown column="age" sortOption={sortOption} />
          </button>
          <button
            onClick={() => sort('price')}
            className="w-[150px] flex items-center gap-1 text-sm font-semibold hover:underline cursor-pointer"
          >
            Price
            <TriangleDown column="price" sortOption={sortOption} />
          </button>
          <button
            onClick={() => sort('daily-volume')}
            className="flex flex-row gap-1 w-[160px] text-sm font-semibold hover:underline cursor-pointer"
          >
            24h Volume
            <div className="flex mr-auto justify-center items-center">
              <QuestionMarkSvg
                data-tooltip-id="24h-volume-info"
                data-tooltip-place="bottom-end"
                data-tooltip-html={'Cumulative volume from 00:00 UTC to now.'}
                className="w-3 h-3"
              />
              <Tooltip
                id="24h-volume-info"
                className="max-w-[300px] bg-gray-950 !opacity-100 z-[100]"
                clickable
              />
              <TriangleDown column="daily-volume" sortOption={sortOption} />
            </div>
          </button>
          <button
            onClick={() => sort('fdv')}
            className="w-[160px] flex items-center gap-1 text-sm font-semibold hover:underline cursor-pointer"
          >
            FDV
            <TriangleDown column="fdv" sortOption={sortOption} />
          </button>
          <button
            onClick={() => sort('daily-change')}
            className="w-[140px] flex items-center gap-1 text-sm font-semibold hover:underline cursor-pointer"
          >
            24h Change
            <TriangleDown column="daily-change" sortOption={sortOption} />
          </button>
          <button
            onClick={() => sort('verified')}
            className="flex items-center gap-1 text-sm font-semibold hover:underline cursor-pointer"
          >
            Verified
            <TriangleDown column="verified" sortOption={sortOption} />
          </button>
        </div>

        {filteredMarkets.length === 0 && <Loading className="mt-36 sm:mt-24" />}

        <div className="relative flex justify-center w-full lg:w-[1072px] h-full lg:h-[680px] mb-6">
          <div className="relative flex justify-center w-full h-full lg:h-[680px] mb-6">
            {/* desktop: 1-column list */}
            <div className="hidden lg:block w-full overflow-hidden">
              <List
                height={680}
                itemCount={filteredMarkets.length}
                itemSize={64 + 12}
                width={1072}
                itemKey={(index) =>
                  `${filteredMarkets[index].baseCurrency.address}-${filteredMarkets[index].quoteCurrency.address}`
                }
              >
                {MarketListRow}
              </List>
            </div>

            {/* tablet: 2-column grid (md~lg) */}
            <div className="hidden md:block lg:hidden w-full overflow-hidden">
              <Grid
                columnCount={2}
                columnWidth={Math.floor((window.innerWidth - 24 * 2) / 2)}
                height={680}
                rowCount={Math.ceil(filteredMarkets.length / 2)}
                rowHeight={MOBILE_ROW_HEIGHT + 12}
                width={window.innerWidth - 24 * 2}
              >
                {({ columnIndex, style }) => {
                  const gapStyle =
                    columnIndex === 0
                      ? { paddingRight: 6 }
                      : columnIndex === 1
                        ? { paddingLeft: 6 }
                        : {}
                  return (
                    <>
                      {MarketGridCell({
                        columnIndex,
                        rowIndex: columnIndex,
                        style: { ...style, ...gapStyle },
                      })}
                    </>
                  )
                }}
              </Grid>
            </div>

            {/* mobile: 1-column list */}
            <div className="block md:hidden w-full overflow-hidden">
              <List
                height={680}
                itemCount={filteredMarkets.length}
                itemSize={MOBILE_ROW_HEIGHT + 12}
                width="100%"
                itemKey={(index) =>
                  `${filteredMarkets[index].baseCurrency.address}-${filteredMarkets[index].quoteCurrency.address}`
                }
              >
                {MarketListRow}
              </List>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
