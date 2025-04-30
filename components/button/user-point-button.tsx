import React from 'react'
import { NextRouter } from 'next/router'

export const UserPointButton = ({ router }: { router: NextRouter }) => {
  return (
    <button
      onClick={() => {
        router.push('/leaderboard')
      }}
      className="group relative cursor-pointer w-full flex h-8 p-2 sm:px-3 text-sm lg:text-base justify-end bg-gray-700 text-gray-50 hover:bg-gray-500 items-center gap-1 shrink-0 border-solid rounded"
    >
      <span className="flex">Points</span>
    </button>
  )
}
