import React, { useMemo } from 'react'
import { FixedSizeList as List } from 'react-window'
import Link from 'next/link'
import { isAddressEqual } from 'viem'

import { shortAddress } from '../utils/address'
import { useWindowWidth } from '../hooks/useWindowWidth'

import { OutlinkSvg } from './svg/outlink-svg'

export const LeaderBoard = ({
  explorerUrl,
  values,
  myValue,
}: {
  explorerUrl: string
  values: {
    rank: number
    value: React.ReactNode
    address: `0x${string}`
  }[]
  myValue?: {
    value: React.ReactNode
    address: `0x${string}`
  }
}) => {
  const width = useWindowWidth()
  const isMobile = width < 640

  const ITEM_HEIGHT = isMobile ? 52 : 48
  const ITEM_GAP = isMobile ? 4 : 8

  const sortedValues = useMemo(
    () =>
      [...values].sort(
        (a, b) =>
          (a.rank ?? Number.MAX_SAFE_INTEGER) -
          (b.rank ?? Number.MAX_SAFE_INTEGER),
      ),
    [values],
  )

  const Row = ({
    index,
    style,
  }: {
    index: number
    style: React.CSSProperties
  }) => {
    const { address, rank, value } = sortedValues[index]

    return (
      <div
        style={{
          ...style,
          top: style.top,
          height: ITEM_HEIGHT,
          marginBottom: ITEM_GAP,
        }}
        className={`self-stretch px-4 sm:px-8 min-h-10 ${
          rank === 1
            ? 'bg-[#ffce50]/20'
            : rank === 2
              ? 'bg-[#d0d6ec]/20'
              : rank === 3
                ? 'bg-[#ffc581]/20'
                : 'bg-gray-900'
        } flex rounded-lg justify-center items-center gap-1.5 sm:text-sm text-xs`}
        key={`vault-liquidity-point-rank-${address}-${rank}`}
      >
        <div
          className={`${
            rank === 1
              ? 'text-[#ffe607]'
              : rank === 2
                ? 'text-[#e4e5f5]'
                : rank === 3
                  ? 'text-[#ffc038]'
                  : 'text-white'
          } w-16 flex justify-start items-center gap-2.5 font-bold`}
        >
          {rank}
        </div>
        <div className="flex w-full">
          <div className="flex flex-1 justify-start items-center text-white gap-1">
            <span className="flex sm:hidden">{shortAddress(address, 2)}</span>
            <span className="hidden sm:flex">{shortAddress(address, 8)}</span>
            <Link
              target="_blank"
              href={`${explorerUrl}/address/${address}`}
              rel="noreferrer"
            >
              <OutlinkSvg className="w-2 h-2 sm:w-3 sm:h-3 flex items-center" />
            </Link>
          </div>
          <div className="flex flex-1 justify-start items-center text-white font-semibold">
            {value}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="self-stretch w-full flex flex-col justify-start items-start gap-1 sm:gap-2">
      {myValue && (
        <div className="self-stretch px-4 sm:px-8 min-h-10 bg-[#75b3ff]/20 flex rounded-lg justify-center items-center gap-1.5 sm:text-sm text-xs">
          <div className="w-16 flex justify-start items-center gap-2.5 text-white font-bold">
            {values.find(({ address }) =>
              isAddressEqual(address, myValue.address),
            )?.rank ?? '-'}
          </div>
          <div className="flex w-full">
            <div className="flex flex-1 justify-start items-center text-blue-400 gap-1">
              Me
              <span className="hidden sm:flex">
                ({shortAddress(myValue.address, 6)})
              </span>
              <Link
                target="_blank"
                href={`${explorerUrl}/address/${myValue.address}`}
                rel="noreferrer"
              >
                <OutlinkSvg className="w-2 h-2 sm:w-3 sm:h-3 flex items-center" />
              </Link>
            </div>
            <div className="flex flex-1 justify-start items-center text-white font-semibold">
              {myValue.value}
            </div>
          </div>
        </div>
      )}

      <List
        height={1000}
        itemCount={sortedValues.length}
        itemSize={ITEM_HEIGHT + ITEM_GAP}
        width="100%"
      >
        {Row}
      </List>
    </div>
  )
}
