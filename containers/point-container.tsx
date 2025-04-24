import React from 'react'
import { useAccount } from 'wagmi'

import { usePointContext } from '../contexts/point-context'
import { LeaderBoard } from '../components/leader-board'
import { toCommaSeparated } from '../utils/number'

export const PointContainer = () => {
  const { address: userAddress } = useAccount()
  const { myVaultPoint, vaultPoints } = usePointContext()

  return (
    <div className="w-full flex flex-col text-white mb-4">
      <div className="flex justify-center w-auto">
        <div className="w-[960px] mt-8 flex flex-col sm:gap-12 items-center">
          <div className="flex w-full h-12 sm:h-[72px] flex-col justify-start items-center gap-2 sm:gap-3">
            <div className="self-stretch text-center text-white text-lg sm:text-4xl font-bold tracking-wide">
              Clober Point
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col items-center mt-6 px-4 lg:px-0 gap-4 sm:gap-8">
        <div className="flex flex-col w-full lg:w-[960px] h-full gap-6">
          <div className="flex flex-col justify-start items-center gap-3 sm:gap-4 mb-4">
            <div className="w-full py-3 sm:py-4 bg-[#1d1f27] sm:bg-[#1c1e27] rounded-xl inline-flex flex-col justify-start items-start gap-3">
              <div className="self-stretch px-4 sm:px-8 inline-flex justify-start items-start gap-1.5 sm:text-sm text-xs">
                <div className="w-16 flex justify-start items-center gap-2.5 text-gray-400">
                  Rank
                </div>
                <div className="flex w-full">
                  <div className="flex flex-1 justify-start items-center gap-2.5">
                    <div className="justify-start text-gray-400">User</div>
                  </div>
                  <div className="flex flex-1 justify-start items-center gap-2.5">
                    <div className="justify-start text-gray-400">Point</div>
                  </div>
                </div>
              </div>
            </div>

            <LeaderBoard
              explorerUrl="https://clober.io"
              maxDisplayRank={100}
              myValue={
                myVaultPoint && userAddress
                  ? {
                      address: userAddress,
                      value: (
                        <>{toCommaSeparated(myVaultPoint.point.toFixed(2))}</>
                      ),
                    }
                  : undefined
              }
              values={vaultPoints
                .sort((a, b) => b.point - a.point)
                .filter((rank) => rank.point >= 0.01)
                .slice(0, 100)
                .map((rank, index) => ({
                  address: rank.userAddress,
                  value: <>{toCommaSeparated(rank.point.toFixed(2))}</>,
                  rank: index + 1,
                }))}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
