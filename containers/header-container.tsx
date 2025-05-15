import React, { useState } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { useRouter } from 'next/router'
import {
  useAccountModal,
  useChainModal,
  useConnectModal,
} from '@rainbow-me/rainbowkit'
import { useQuery } from '@tanstack/react-query'
import { monadTestnet } from 'viem/chains'
import Image from 'next/image'

import { useChainContext } from '../contexts/chain-context'
import MenuSvg from '../components/svg/menu-svg'
import { PageButton } from '../components/button/page-button'
import { ConnectButton } from '../components/button/connect-button'
import { UserButton } from '../components/button/user-button'
import { UserTransactionsModal } from '../components/modal/user-transactions-modal'
import { useTransactionContext } from '../contexts/transaction-context'
import { UserPointButton } from '../components/button/user-point-button'
import ChainIcon from '../components/icon/chain-icon'
import { textStyles } from '../themes/text-styles'
import { PAGE_BUTTONS } from '../constants/buttons'
import { fetchEnsName } from '../apis/ens'

const WrongNetwork = ({
  openChainModal,
}: { openChainModal: () => void } & any) => {
  return <>{openChainModal && openChainModal()}</>
}

const PageButtons = () => {
  const router = useRouter()

  return (
    <>
      {PAGE_BUTTONS.map((page) => (
        <div key={page.path}>
          <PageButton
            disabled={router.pathname.includes(page.path)}
            onClick={() => router.push(page.path)}
          >
            {page.icon}
            {page.label}
          </PageButton>
        </div>
      ))}
    </>
  )
}

const HeaderContainer = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const router = useRouter()
  const { selectedChain } = useChainContext()
  const { chainId, address, status, connector } = useAccount()
  const { openChainModal } = useChainModal()
  const { openConnectModal } = useConnectModal()
  const { openAccountModal } = useAccountModal()
  const { disconnectAsync } = useDisconnect()
  const [openTransactionHistoryModal, setOpenTransactionHistoryModal] =
    useState(false)
  const { pendingTransactions, transactionHistory } = useTransactionContext()

  const { data: ens } = useQuery({
    queryKey: ['ens', selectedChain.id, address],
    queryFn: async () => {
      if (!address) {
        return null
      }
      return fetchEnsName(selectedChain, address)
    },
    initialData: null,
  })

  return (
    <>
      {openTransactionHistoryModal && address && connector && (
        <UserTransactionsModal
          chain={selectedChain}
          userAddress={address}
          connector={connector}
          pendingTransactions={pendingTransactions}
          transactionHistory={transactionHistory}
          disconnectAsync={disconnectAsync}
          onClose={() => setOpenTransactionHistoryModal(false)}
          ens={ens}
        />
      )}

      <div className="flex items-center bg-gray-800 bg-opacity-50 justify-between h-[46px] md:h-[60px] py-0 px-4">
        <div className="flex items-center gap-2.5 md:gap-12">
          {router.pathname.includes('/futures') ? (
            <a
              className="flex gap-2 items-center"
              target="_blank"
              href="https://alpha.clober.io/futures"
              rel="noopener noreferrer"
            >
              <img className="h-7 sm:h-9" src="/futures-logo.svg" alt="logo" />
            </a>
          ) : (
            <>
              <a
                className="hidden md:flex gap-2 items-center h-7"
                target="_blank"
                href="https://clober.io"
                rel="noopener noreferrer"
              >
                <Image width={123} height={28} src="/logo.svg" alt="logo" />
              </a>
              <a
                className="flex md:hidden gap-2 items-center h-5"
                target="_blank"
                href="https://clober.io"
                rel="noopener noreferrer"
              >
                <Image width={88} height={20} src="/logo.svg" alt="logo" />
              </a>
            </>
          )}
          <div className="hidden xl:flex py-1 justify-start items-center gap-8">
            <PageButtons />
          </div>
        </div>
        <div className="flex gap-2 w-auto md:gap-4 ml-auto">
          <div className="flex relative justify-center items-center">
            <div className="flex items-center justify-center lg:justify-start h-8 w-8 lg:w-auto p-0 lg:px-4 lg:gap-2 rounded bg-gray-800 hover:bg-gray-700 text-white">
              <ChainIcon className="w-4 h-4" chain={selectedChain} />
              <p className={`hidden lg:block ${textStyles.body3Bold}`}>
                {selectedChain.name}
              </p>
            </div>
          </div>

          <div className="flex items-center flex-row gap-1 sm:gap-3">
            {address && selectedChain.id === monadTestnet.id && (
              <div className="relative flex w-full">
                <UserPointButton router={router} />
              </div>
            )}
            {status === 'disconnected' || status === 'connecting' ? (
              <ConnectButton openConnectModal={openConnectModal} />
            ) : openAccountModal && address && connector && chainId ? (
              <UserButton
                chain={selectedChain}
                address={address}
                openTransactionHistoryModal={() =>
                  setOpenTransactionHistoryModal(true)
                }
                connector={connector}
                shiny={pendingTransactions.length > 0}
                ens={ens}
              />
            ) : openChainModal ? (
              <WrongNetwork openChainModal={openChainModal} />
            ) : (
              <button
                disabled={true}
                className="flex items-center h-8 py-0 px-3 md:px-4 rounded bg-blue-500 hover:bg-blue-600 disabled:bg-gray-800 text-white disabled:text-green-500 text-xs sm:text-sm"
              >
                {status}
              </button>
            )}
          </div>
          <button
            className="w-8 h-8 hover:bg-gray-700 rounded sm:rounded-lg flex items-center justify-center"
            onClick={onMenuClick}
          >
            <MenuSvg />
          </button>
        </div>
      </div>
    </>
  )
}

export default HeaderContainer
