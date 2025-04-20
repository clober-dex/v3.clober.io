import React, { useCallback, useMemo, useRef, useState } from 'react'
import { createPublicClient, http } from 'viem'
import { useQuery } from '@tanstack/react-query'
import { Tooltip } from 'react-tooltip'

import { MarketCard } from '../components/card/market-card'
import { useChainContext } from '../contexts/chain-context'
import { SearchSvg } from '../components/svg/search-svg'
import { fetchAllMarkets } from '../apis/market'
import { useCurrencyContext } from '../contexts/currency-context'
import { RPC_URL } from '../constants/rpc-url'
import { QuestionMarkSvg } from '../components/svg/question-mark-svg'
import { TriangleDownSvg } from '../components/svg/triangle-down-svg'
import { Market } from '../model/market'
import { useTransactionContext } from '../contexts/transaction-context'
import { Chain } from '../model/chain'

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
      transport: http(RPC_URL[selectedChain.id]),
    })
  }, [selectedChain])
  const prevMarkets = useRef<Market[]>(
    JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_MARKET_KEY(selectedChain)) ?? '[]',
    ) as Market[],
  )
  const prevSubgraphBlockNumber = useRef<number>(0)

  const [searchValue, setSearchValue] = React.useState('')
  const [sortOption, setSortOption] = useState<SortOption>('none')

  const { data: markets } = useQuery({
    queryKey: ['markets', selectedChain.id, latestSubgraphBlockNumber, prices],
    queryFn: async () => {
      if (latestSubgraphBlockNumber.blockNumber === 0) {
        return [] as Market[]
      }
      if (
        prevSubgraphBlockNumber.current !==
        latestSubgraphBlockNumber.blockNumber
      ) {
        const market = await fetchAllMarkets(
          publicClient,
          selectedChain,
          prices,
          whitelistCurrencies.map((currency) => currency.address),
          prevMarkets.current,
        )
        prevMarkets.current = market
        prevSubgraphBlockNumber.current = latestSubgraphBlockNumber.blockNumber
        localStorage.setItem(
          LOCAL_STORAGE_MARKET_KEY(selectedChain),
          JSON.stringify(market),
        )
        return market
      }
      return prevMarkets.current
    },
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
            name="search"
            id="search"
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
          <div className="w-[180px] text-sm font-semibold">
            <button
              onClick={() => sort('age')}
              className="w-[330px] flex items-center gap-1 text-sm font-semibold hover:underline cursor-pointer"
            >
              Age
              <TriangleDown column="age" sortOption={sortOption} />
            </button>
          </div>
          <button
            onClick={() => sort('price')}
            className="w-[160px] flex items-center gap-1 text-sm font-semibold hover:underline cursor-pointer"
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
        <div className="relative flex justify-center w-full h-full lg:h-[680px] mb-6">
          <div className="lg:absolute lg:top-0 lg:overflow-x-scroll w-full h-full items-center flex flex-1 flex-col md:grid md:grid-cols-2 lg:flex gap-3">
            {filteredMarkets.map((market) => {
              return (
                <MarketCard
                  chain={selectedChain}
                  key={`${market.baseCurrency.address}-${market.quoteCurrency.address}`}
                  baseCurrency={market.baseCurrency}
                  quoteCurrency={market.quoteCurrency}
                  createAt={market.createAt}
                  price={market.price}
                  dailyVolume={market.dailyVolume}
                  fdv={market.fdv}
                  dailyChange={market.dailyChange}
                  verified={market.verified}
                  isBidTaken={market.isBidTaken}
                  isAskTaken={market.isAskTaken}
                />
              )
            })}

            {filteredMarkets.length === 0 && searchValue.length === 0 && (
              <div
                role="status"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-24 lg:mt-0"
              >
                <svg
                  aria-hidden="true"
                  className="w-8 h-8 animate-spin text-gray-600 fill-blue-600"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
