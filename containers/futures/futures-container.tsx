import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAccount } from 'wagmi'
import { parseUnits } from 'viem'

import { FuturesAssetCard } from '../../components/card/futures-asset-card'
import { FuturesPosition } from '../../model/futures/futures-position'
import { FuturesPositionCard } from '../../components/card/futures-position-card'
import { useCurrencyContext } from '../../contexts/currency-context'
import { currentTimestampInSeconds } from '../../utils/date'
import { useFuturesContext } from '../../contexts/futures/futures-context'
import { FuturesRedeemCard } from '../../components/card/futures-redeem-card'
import { formatUnits } from '../../utils/bigint'
import { useFuturesContractContext } from '../../contexts/futures/futures-contract-context'
import { WHITE_LISTED_ASSETS } from '../../constants/futures/asset'
import { useChainContext } from '../../contexts/chain-context'

import { FuturesPositionAdjustModalContainer } from './futures-position-adjust-modal-container'
import { FuturesPositionEditCollateralModalContainer } from './futures-position-edit-collateral-modal-container'

export const FuturesContainer = () => {
  const router = useRouter()
  const { selectedChain } = useChainContext()
  const { settle, close, redeem, pendingPositionCurrencies } =
    useFuturesContractContext()
  const { prices, balances } = useCurrencyContext()
  const { assets, positions } = useFuturesContext()
  const { address: userAddress } = useAccount()

  const [tab, setTab] = React.useState<'my-cdp' | 'redeem' | 'mint'>(
    pendingPositionCurrencies.length > 0 ? 'my-cdp' : 'mint',
  )

  useEffect(() => {
    if (pendingPositionCurrencies.length > 0) {
      setTab('my-cdp')
    }
  }, [pendingPositionCurrencies.length])

  const [adjustPosition, setAdjustPosition] = useState<FuturesPosition | null>(
    null,
  )
  const [editCollateralPosition, setEditCollateralPosition] =
    useState<FuturesPosition | null>(null)
  const now = currentTimestampInSeconds()

  const calculateSettledCollateral = useCallback(
    (
      balance: bigint,
      settlePrice: number,
      currencyDecimals: number,
      collateralDecimals: number,
    ) => {
      return parseUnits(
        (Number(formatUnits(balance, currencyDecimals)) * settlePrice).toFixed(
          18,
        ),
        collateralDecimals,
      )
    },
    [],
  )

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
                onClick={() => setTab('redeem')}
                disabled={tab === 'redeem'}
                className="flex flex-1 gap-2 items-center justify-center w-full h-full text-gray-500 disabled:text-white disabled:bg-gray-800 bg-transparent rounded-tl-2xl rounded-tr-2xl"
              >
                <div className="text-center text-sm sm:text-base font-bold">
                  Redeem
                </div>
              </button>

              <button
                onClick={() => userAddress && setTab('my-cdp')}
                disabled={tab === 'my-cdp'}
                className="flex flex-1 gap-2 items-center justify-center w-full h-full text-gray-500 disabled:text-white disabled:bg-gray-800 bg-transparent rounded-tl-2xl rounded-tr-2xl"
              >
                <div className="text-center text-sm sm:text-base font-bold">
                  My CDP
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      {tab === 'mint' ? (
        <div className="flex w-auto flex-col items-center mt-6 lg:mt-12 px-4 lg:px-0">
          <div className="flex flex-col w-full lg:w-[1040px] h-full gap-6">
            <div className="hidden lg:flex self-stretch px-4 justify-start items-center gap-4">
              <div className="w-44 text-gray-400 text-sm font-semibold">
                Asset
              </div>
              <div className="w-36 text-gray-400 text-sm font-semibold">
                Collateral
              </div>
              <div className="w-[160px] text-gray-400 text-sm font-semibold">
                Expiry Date
              </div>
              <div className="w-[140px] text-gray-400 text-sm font-semibold">
                Max LTV
              </div>
            </div>
            <div className="relative flex justify-center w-full h-full lg:h-[680px] mb-6">
              <div className="lg:absolute lg:top-0 lg:overflow-x-scroll w-full h-full items-center flex flex-1 flex-col md:grid md:grid-cols-2 lg:flex gap-3">
                {assets
                  .filter((asset) => asset.expiration > now)
                  .filter((asset) =>
                    WHITE_LISTED_ASSETS.includes(asset.currency.address),
                  )
                  .sort((a, b) =>
                    a.currency.symbol.localeCompare(b.currency.symbol),
                  )
                  .map((asset, index) => (
                    <FuturesAssetCard
                      chain={selectedChain}
                      key={`mint-${asset.id}-${index}`}
                      asset={asset}
                      router={router}
                    />
                  ))}

                {assets.length === 0 && (
                  <div
                    role="status"
                    className="absolute top-32 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-24 lg:mt-0"
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
      ) : tab === 'redeem' ? (
        <div className="flex w-auto flex-col items-center mt-6 lg:mt-12 px-4 lg:px-0">
          <div className="flex flex-col w-full md:w-[740px] lg:w-[1060px] h-full gap-6">
            <div className="relative flex justify-center w-full h-full">
              <div className="w-full h-full items-center flex flex-1 flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-[18px]">
                {assets
                  .filter(
                    (asset) =>
                      asset.expiration < now &&
                      balances[asset.currency.address] > 0n &&
                      WHITE_LISTED_ASSETS.includes(asset.currency.address),
                  )
                  .map((asset, index) => (
                    <FuturesRedeemCard
                      chain={selectedChain}
                      key={`redeem-${asset.id}-${index}`}
                      asset={asset}
                      balance={balances[asset.currency.address] ?? 0n}
                      prices={prices}
                      redeemableCollateral={calculateSettledCollateral(
                        balances[asset.currency.address] ?? 0n,
                        asset.settlePrice,
                        asset.currency.decimals,
                        asset.collateral.decimals,
                      )}
                      actionButtonProps={{
                        text: asset.settlePrice > 0 ? 'Redeem' : 'Settle',
                        disabled: false,
                        onClick: async () => {
                          if (asset.settlePrice > 0) {
                            await redeem(
                              asset,
                              balances[asset.currency.address] ?? 0n,
                              calculateSettledCollateral(
                                balances[asset.currency.address] ?? 0n,
                                asset.settlePrice,
                                asset.currency.decimals,
                                asset.collateral.decimals,
                              ),
                            )
                          } else {
                            await settle(asset)
                          }
                        },
                      }}
                    />
                  ))}
              </div>
            </div>
          </div>
        </div>
      ) : tab === 'my-cdp' ? (
        <div className="flex flex-1 flex-col justify-center items-center pt-6">
          <div className="flex flex-1 flex-col w-full md:w-[740px] lg:w-[1060px]">
            <div className="flex flex-1 flex-col w-full h-full sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 mb-8 justify-center">
              {positions
                .filter((position) => position.averagePrice > 0)
                .map((position, index) => (
                  <FuturesPositionCard
                    chain={selectedChain}
                    key={`${position.asset.id}-${index}`}
                    position={position}
                    loanAssetPrice={
                      prices[position.asset.currency.address] ?? 0
                    }
                    isPending={false} // We are using on-chain data
                    onEditCollateral={() => setEditCollateralPosition(position)}
                    onClickButton={async () => {
                      if (position.asset.expiration < now) {
                        if (position.asset.settlePrice > 0) {
                          const collateralReceived =
                            (position?.collateralAmount ?? 0n) -
                            calculateSettledCollateral(
                              balances[position.asset.currency.address] ?? 0n,
                              position.asset.settlePrice,
                              position.asset.currency.decimals,
                              position.asset.collateral.decimals,
                            )
                          await close(position.asset, collateralReceived)
                        } else {
                          await settle(position.asset)
                        }
                      } else {
                        setAdjustPosition(position)
                      }
                    }}
                  />
                ))}
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}

      {/*{isMarketClose ? (*/}
      {/*  <Modal*/}
      {/*    show*/}
      {/*    onClose={() => {}}*/}
      {/*    onButtonClick={() => setIsMarketClose(false)}*/}
      {/*  >*/}
      {/*    <h1 className="flex font-bold text-xl mb-2">Notice</h1>*/}
      {/*    <div className="text-sm">*/}
      {/*      our price feeds follow the traditional market hours of each asset*/}
      {/*      classes and will be available at the following hours:{' '}*/}
      {/*      <span>*/}
      {/*        <Link*/}
      {/*          className="text-blue-500 underline font-bold"*/}
      {/*          target="_blank"*/}
      {/*          href="https://docs.pyth.network/price-feeds/market-hours"*/}
      {/*        >*/}
      {/*          [Link]*/}
      {/*        </Link>*/}
      {/*      </span>*/}
      {/*    </div>*/}
      {/*  </Modal>*/}
      {/*) : (*/}
      {/*  <></>*/}
      {/*)}*/}

      {adjustPosition ? (
        <FuturesPositionAdjustModalContainer
          userPosition={adjustPosition}
          onClose={() => setAdjustPosition(null)}
        />
      ) : (
        <></>
      )}

      {editCollateralPosition ? (
        <FuturesPositionEditCollateralModalContainer
          userPosition={editCollateralPosition}
          onClose={() => setEditCollateralPosition(null)}
        />
      ) : (
        <></>
      )}
    </div>
  )
}
