import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { useAccount } from 'wagmi'

import { FutureAssetCard } from '../../components/card/future-asset-card'
import { useChainContext } from '../../contexts/chain-context'
import { ASSETS } from '../../constants/future/asset'
import { UserPosition } from '../../model/future/user-position'
import { FutureAssetShortPositionCard } from '../../components/card/future-asset-short-position-card'
import { useCurrencyContext } from '../../contexts/currency-context'
import { FutureAssetLongPositionCard } from '../../components/card/future-asset-long-position-card'
import { currentTimestampInSeconds } from '../../utils/date'
import { useFutureContext } from '../../contexts/future/future-context'

import { FuturePositionAdjustModalContainer } from './future-position-adjust-modal-container'

export const FutureContainer = () => {
  const { selectedChain } = useChainContext()
  const router = useRouter()
  const { prices } = useCurrencyContext()
  const { positions } = useFutureContext()
  const { address: userAddress } = useAccount()

  const [tab, setTab] = React.useState<'my-position' | 'mint'>('mint')
  const [adjustPosition, setAdjustPosition] = useState<UserPosition | null>(
    null,
  )
  const now = currentTimestampInSeconds()

  return (
    <div className="w-full flex flex-col text-white mt-8">
      <div className="flex justify-center w-auto sm:h-[240px]">
        <div className="w-[960px] mt-8 sm:mt-16 flex flex-col sm:gap-12 items-center">
          <div className="flex w-full flex-col justify-start items-center gap-2 sm:gap-3">
            <div className="self-stretch text-center text-white text-lg sm:text-4xl font-bold">
              Futures
            </div>
            <div className="self-stretch text-center text-gray-400 text-xs sm:text-sm font-bold">
              Mint & Trade Synthetic Assets on Clober
            </div>
          </div>

          <div className="flex w-full mt-8 sm:mt-0 sm:mr-auto px-4">
            <div className="w-full sm:w-[328px] h-[40px] sm:h-[56px] items-center flex">
              <button
                onClick={() => setTab('mint')}
                disabled={tab === 'mint'}
                className="flex flex-1 gap-2 items-center justify-center w-full h-full text-gray-500 disabled:text-white disabled:bg-gray-800 bg-transparent rounded-tl-2xl rounded-tr-2xl"
              >
                <div className="text-center text-sm sm:text-base font-bold">
                  Mint
                </div>
              </button>
              <button
                onClick={() => userAddress && setTab('my-position')}
                disabled={tab === 'my-position'}
                className="flex flex-1 gap-2 items-center justify-center w-full h-full text-gray-500 disabled:text-white disabled:bg-gray-800 bg-transparent rounded-tl-2xl rounded-tr-2xl"
              >
                <div className="text-center text-sm sm:text-base font-bold">
                  My Positions
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      {tab === 'mint' ? (
        <div className="flex w-auto flex-col items-center mt-6 lg:mt-12 px-4 lg:px-0">
          <div className="flex flex-col w-full lg:w-[960px] h-full gap-6">
            <div className="hidden lg:flex self-stretch px-4 justify-start items-center gap-4">
              <div className="w-36 text-gray-400 text-sm font-semibold">
                Asset
              </div>
              <div className="w-36 text-gray-400 text-sm font-semibold">
                Collateral
              </div>
              <div className="w-[140px] text-gray-400 text-sm font-semibold">
                Max LTV
              </div>
              <div className="w-[140px] text-gray-400 text-sm font-semibold">
                Expiry Date
              </div>
            </div>
            <div className="relative flex justify-center w-full h-full lg:h-[360px]">
              <div className="lg:absolute lg:top-0 lg:overflow-x-scroll w-full h-full items-center flex flex-1 flex-col md:grid md:grid-cols-2 lg:flex gap-3">
                {(ASSETS[selectedChain.id] ?? [])
                  .filter((asset) => asset.expiration > now)
                  .map((asset, index) => (
                    <FutureAssetCard
                      chainId={selectedChain.id}
                      key={index}
                      asset={asset}
                      router={router}
                    />
                  ))}
              </div>
            </div>
          </div>
        </div>
      ) : tab === 'my-position' ? (
        <div className="flex flex-1 flex-col justify-center items-center pt-6">
          <div className="flex flex-1 flex-col w-full md:w-[740px] lg:w-[1060px]">
            <div className="flex flex-1 flex-col w-full h-full sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 mb-8 justify-center">
              {positions
                .filter((position) => position.averagePrice > 0)
                .map((position, index) =>
                  position.type === 'short' ? (
                    <FutureAssetShortPositionCard
                      key={`${position.type}-${position.asset.id}-${index}`}
                      position={position}
                      loanAssetPrice={
                        prices[position.asset.currency.address] ?? 0
                      }
                      onAdjustMultiple={() => {
                        setAdjustPosition(position)
                      }}
                    />
                  ) : (
                    <FutureAssetLongPositionCard
                      chainId={selectedChain.id}
                      key={`${position.type}-${position.asset.id}-${index}`}
                      position={position}
                      loanAssetPrice={
                        prices[position.asset.currency.address] ?? 0
                      }
                      router={router}
                    />
                  ),
                )}
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}

      {adjustPosition ? (
        <FuturePositionAdjustModalContainer
          userPosition={adjustPosition}
          onClose={() => setAdjustPosition(null)}
        />
      ) : (
        <></>
      )}
    </div>
  )
}
