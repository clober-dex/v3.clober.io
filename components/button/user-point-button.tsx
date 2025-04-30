import React, { useCallback } from 'react'
import CountUp from 'react-countup'
import { NextRouter } from 'next/router'

import { toHumanReadableString } from '../../utils/number'

export const UserPointButton = ({
  score,
  router,
}: {
  score: number
  router: NextRouter
}) => {
  const countUpFormatter = useCallback((value: number): string => {
    return toHumanReadableString(value)
  }, [])
  return (
    <button
      onClick={() => {
        router.push('/leaderboard')
      }}
      className="cursor-pointer w-[75px] sm:w-[125px] flex h-8 p-2 sm:px-3 text-sm lg:text-base justify-end bg-gray-800 hover:bg-gray-700 items-center gap-1 shrink-0 border-solid rounded"
    >
      <span className="font-semibold">
        <CountUp
          end={score}
          formattingFn={countUpFormatter}
          preserveValue
          useEasing={false}
          duration={1}
        />
      </span>
      <span className="text-gray-400 hidden sm:flex">Points</span>
      <span className="text-gray-400 flex sm:hidden">P</span>
    </button>
  )
}
