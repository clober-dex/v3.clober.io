import React from 'react'
import { useAccount } from 'wagmi'
import { Tooltip } from 'react-tooltip'
import { useQuery } from '@tanstack/react-query'
import { getPoolSnapshots } from '@clober/v2-sdk'

import { usePoolContext } from '../../contexts/pool/pool-context'
import { useChainContext } from '../../contexts/chain-context'
import { QuestionMarkSvg } from '../../components/svg/question-mark-svg'
import { useCurrencyContext } from '../../contexts/currency-context'
import { Loading } from '../../components/loading'
import { fetchPoolSnapshots } from '../../apis/pool'

export const PoolContainer = () => {
  const { address: userAddress } = useAccount()
  const { lpBalances } = usePoolContext()
  const { selectedChain } = useChainContext()
  const { prices } = useCurrencyContext()

  const [tab, setTab] = React.useState<'my-liquidity' | 'pool'>('pool')

  const { data: poolSnapshots } = useQuery({
    queryKey: [
      'pool-snapshots',
      selectedChain.id,
      Object.keys(prices).length !== 0,
    ],
    queryFn: async () => {
      return getPoolSnapshots({ chainId: selectedChain.id })
    },
    initialData: [],
  })

  return (
    <div className="w-full flex flex-col text-white mb-4">
      <div className="flex justify-center w-auto sm:h-[400px]">
        <div className="w-[960px] mt-8 sm:mt-16 flex flex-col sm:gap-12 items-center">
          <div className="flex w-full h-12 sm:h-[72px] flex-col justify-start items-center gap-2 sm:gap-3">
            <div className="self-stretch text-center text-white text-lg sm:text-4xl font-bold">
              Clober Liquidity Vault (CLV)
            </div>
            <div className="self-stretch text-center text-gray-400 text-xs sm:text-sm font-bold">
              Provide liquidity and earn fees!
            </div>
          </div>
          <div className="flex w-full h-20 mt-6 sm:mt-0 sm:h-28 px-4 justify-start items-center gap-3 sm:gap-4">
            <div className="grow shrink basis-0 h-full px-6 py-4 sm:px-8 sm:py-6 bg-[rgba(96,165,250,0.10)] rounded-xl sm:rounded-2xl flex-col justify-center items-center gap-3 inline-flex bg-gray-800">
              <div className="text-center text-gray-400 text-sm font-semibold">
                TVL
              </div>
              <div className="self-stretch text-center text-white text-lg sm:text-2xl font-bold">
                {/*$*/}
                {/*{toCommaSeparated(*/}
                {/*  pools.reduce((acc, vault) => acc + vault.tvl, 0).toFixed(2),*/}
                {/*)}*/}
              </div>
            </div>
            <div className="grow shrink basis-0 h-full px-6 py-4 sm:px-8 sm:py-6 bg-[rgba(96,165,250,0.10)] rounded-xl sm:rounded-2xl flex-col justify-center items-center gap-3 inline-flex bg-gray-800">
              <div className="text-center text-gray-400 text-sm font-semibold">
                24h Volume
              </div>
              <div className="self-stretch text-center text-white text-lg sm:text-2xl font-bold">
                {/*$*/}
                {/*{toCommaSeparated(*/}
                {/*  pools*/}
                {/*    .reduce((acc, vault) => acc + vault.volume24h, 0)*/}
                {/*    .toFixed(2),*/}
                {/*)}*/}
              </div>
            </div>
          </div>
          <div className="flex w-full mt-8 sm:mt-0 sm:mr-auto px-4">
            <div className="w-full sm:w-[378px] h-[40px] sm:h-[56px] items-center flex">
              <button
                onClick={() => setTab('pool')}
                disabled={tab === 'pool'}
                className="flex flex-1 gap-2 items-center justify-center w-full h-full text-gray-500 disabled:text-white disabled:bg-gray-800 bg-transparent rounded-tl-2xl rounded-tr-2xl"
              >
                <div className="text-center text-sm sm:text-base font-bold">
                  CLV
                </div>
              </button>

              <button
                onClick={() =>
                  userAddress &&
                  Object.entries(lpBalances).filter(([, amount]) => amount > 0n)
                    .length > 0 &&
                  setTab('my-liquidity')
                }
                disabled={tab === 'my-liquidity'}
                className="flex flex-1 gap-2 items-center justify-center w-full h-full text-gray-500 disabled:text-white disabled:bg-gray-800 bg-transparent rounded-tl-2xl rounded-tr-2xl"
              >
                <div className="text-center text-sm sm:text-base font-bold">
                  My Vaults
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-full flex-col items-center mt-6 px-4 lg:px-0 gap-4 sm:gap-8">
        <div className={`flex flex-col w-full lg:w-[1060px] h-full gap-6`}>
          {tab === 'pool' ? (
            <>
              <div className="hidden lg:flex self-stretch px-4 justify-start items-center gap-4">
                <div className="w-72 text-gray-400 text-sm font-semibold">
                  Liquidity Vault
                </div>
                <div className="flex flex-row gap-2 w-[120px] text-gray-400 text-sm font-semibold">
                  APY
                  <div className="flex mr-auto justify-center items-center">
                    <QuestionMarkSvg
                      data-tooltip-id="apy-info"
                      data-tooltip-place="bottom-end"
                      data-tooltip-html={'Annualized Return'}
                      className="w-3 h-3"
                    />
                    <Tooltip
                      id="apy-info"
                      className="max-w-[300px] bg-gray-950 !opacity-100 z-[100]"
                      clickable
                    />
                  </div>
                </div>
                <div className="w-[120px] text-gray-400 text-sm font-semibold">
                  Total Liquidity
                </div>
                <div className="w-[140px] text-gray-400 text-sm font-semibold">
                  24h Volume
                </div>
              </div>

              {poolSnapshots.length === 0 && (
                <Loading className="flex mt-8 sm:mt-0" />
              )}

              <div className="relative flex justify-center w-full h-full lg:h-[660px]">
                <div className="lg:absolute lg:top-0 lg:overflow-x-scroll w-full h-full items-center flex flex-1 flex-col md:grid md:grid-cols-2 lg:flex gap-3">
                  {/*{pools.map((vault, index) => (*/}
                  {/*  <PoolCard*/}
                  {/*    chain={selectedChain}*/}
                  {/*    key={index}*/}
                  {/*    poolKey={vault.key}*/}
                  {/*    router={router}*/}
                  {/*  />*/}
                  {/*))}*/}
                </div>
              </div>
            </>
          ) : tab === 'my-liquidity' ? (
            <div className="w-full h-full items-center flex flex-1 flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-[18px]">
              {/*{Object.entries(lpBalances)*/}
              {/*  .filter(([, amount]) => amount > 0n)*/}
              {/*  .map(([vaultKey, amount]) => {*/}
              {/*    const vault = pools.find((vault) => vault.key === vaultKey)*/}
              {/*    if (!vault) {*/}
              {/*      return <></>*/}
              {/*    }*/}
              {/*    return (*/}
              {/*      <VaultPositionCard*/}
              {/*        chain={selectedChain}*/}
              {/*        key={vault.key}*/}
              {/*        vaultPosition={{*/}
              {/*          vault,*/}
              {/*          amount,*/}
              {/*          value:*/}
              {/*            vault.lpUsdValue **/}
              {/*            Number(*/}
              {/*              formatUnits(amount, vault.lpCurrency.decimals),*/}
              {/*            ),*/}
              {/*        }}*/}
              {/*        router={router}*/}
              {/*      />*/}
              {/*    )*/}
              {/*  })}*/}
            </div>
          ) : (
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
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
