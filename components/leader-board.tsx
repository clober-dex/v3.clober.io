import React from 'react'
import { isAddressEqual } from 'viem'
import Link from 'next/link'

import { shortAddress } from '../utils/address'

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
  return (
    <div className="self-stretch w-full flex flex-col justify-start items-start gap-1 sm:gap-2 overflow-y-scroll pb-30 sm:pb-40">
      {myValue && (
        <div className="self-stretch px-4 sm:px-8 min-h-10 bg-[#75b3ff]/20 flex rounded-lg justify-center items-center gap-1.5 sm:text-sm text-xs">
          <div className="w-16 flex justify-start items-center gap-2.5 text-white font-bold">
            {values.find(({ address }) =>
              isAddressEqual(address, myValue.address),
            )?.rank ?? '-'}
          </div>
          <div className="flex w-full">
            <Link
              target="_blank"
              href={`${explorerUrl}/address/${myValue.address}`}
              rel="noreferrer"
              className="flex flex-1 justify-start items-center text-blue-400 gap-1"
            >
              Me
              <span className="hidden sm:flex">
                ({shortAddress(myValue.address, 6)})
              </span>
            </Link>
            <div className="flex flex-1 justify-start items-center text-white font-semibold">
              {myValue.value}
            </div>
          </div>
        </div>
      )}

      {values
        .sort(
          (a, b) =>
            (a.rank ?? Number.MAX_SAFE_INTEGER) -
            (b.rank ?? Number.MAX_SAFE_INTEGER),
        )
        .map(({ address, value, rank }) => (
          <div
            key={`vault-liquidity-point-rank-${address}-${rank}`}
            className={`self-stretch px-4 sm:px-8 min-h-10 ${rank === 1 ? 'bg-[#ffce50]/20' : rank === 2 ? 'bg-[#d0d6ec]/20' : rank === 3 ? 'bg-[#ffc581]/20' : 'bg-gray-900'} flex rounded-lg justify-center items-center gap-1.5 sm:text-sm text-xs`}
          >
            <div
              className={`${rank === 1 ? 'text-[#ffe607]' : rank === 2 ? 'text-[#e4e5f5]' : rank === 3 ? 'text-[#ffc038]' : 'text-white'} w-16 flex justify-start items-center gap-2.5 text-white font-bold`}
            >
              {rank}
            </div>
            <div className="flex w-full">
              <Link
                target="_blank"
                href={`${explorerUrl}/address/${address}`}
                rel="noreferrer"
                className="flex flex-1 justify-start items-center text-white gap-1"
              >
                <span className="flex sm:hidden">
                  {shortAddress(address, 2)}
                </span>
                <span className="hidden sm:flex">
                  {shortAddress(address, 8)}
                </span>
              </Link>
              <div className="flex flex-1 justify-start items-center text-white font-semibold">
                {value}
              </div>
            </div>
          </div>
        ))}
    </div>
  )
}
