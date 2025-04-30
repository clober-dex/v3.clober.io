import React from 'react'
import { NextRouter } from 'next/router'

import { BalloonModal } from '../modal/balloon-modal'

export const UserPointButton = ({ router }: { router: NextRouter }) => {
  return (
    <button
      onClick={() => {
        router.push('/leaderboard')
      }}
      className="sm:group font-semibold relative cursor-pointer w-full flex h-8 p-2 sm:px-3 text-sm lg:text-base justify-end bg-gray-700 text-gray-50 hover:bg-gray-500 items-center gap-1 shrink-0 border-solid rounded"
    >
      <span className="flex">Points</span>

      <BalloonModal className="hidden group-hover:flex absolute top-10 right-1/2">
        <div className="flex w-full text-nowrap justify-center items-center text-white bg-gray-800 rounded-lg p-2 text-xs sm:text-sm">
          Check your points and leaderboard!
        </div>
      </BalloonModal>
    </button>
  )
}
