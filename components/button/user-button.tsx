import React from 'react'
import { Connector } from 'wagmi'

import { textStyles } from '../../themes/text-styles'
import { formatAddress } from '../../utils/string'
import ChainIcon from '../icon/chain-icon'
import { supportChains } from '../../constants/chain'
import UserIcon from '../icon/user-icon'

export const UserButton = ({
  address,
  connector,
  chainId,
  openAccountModal,
  shiny,
}: {
  address: `0x${string}`
  connector: Connector
  chainId: number
  openAccountModal: () => void
  shiny?: boolean
}) => {
  const chain = supportChains.find((chain) => chain.id === chainId)!
  return (
    <button
      className="group"
      onClick={() => openAccountModal && openAccountModal()}
    >
      <span
        className={`relative p-0.5 rounded transition duration-300 overflow-hidden flex items-center justify-center ${shiny ? 'before:opacity-100' : 'before:opacity-0'} before:absolute before:w-1/2 before:pb-[120%] sm:before:pb-[110%] before:bg-[linear-gradient(90deg,_theme(colors.blue.500/0)_0%,_theme(colors.blue.500)_35%,_theme(colors.blue.500)_50%,_theme(colors.blue.500)_65%,_theme(colors.blue.500/0)_100%)] before:animate-[spin_3s_linear_infinite]`}
      >
        <span className="relative whitespace-nowrap">
          <span className="z-10 transition-opacity ease-in-out flex items-center justify-center gap-2 md:justify-start rounded md:w-full py-0 px-2 md:px-4 cursor-pointer h-8 bg-gray-800 active::bg-gray-600">
            <div className="w-6 h-4 relative">
              {connector.icon ? (
                <img
                  src={connector.icon}
                  alt="user-icon"
                  className="w-4 h-4 absolute left-0 top-0 z-[2] rounded-full"
                />
              ) : (
                <UserIcon
                  className="w-4 h-4 absolute left-0 top-0 z-[2] rounded-full aspect-square"
                  address={address}
                />
              )}
              <ChainIcon
                chain={chain}
                className="w-4 h-4 absolute left-2 top-0 z-[1] rounded-full"
              />
            </div>

            <span
              className={`hidden md:block text-white ${textStyles.body3Bold}`}
            >
              {formatAddress(address || '')}
            </span>
          </span>
          <span
            className="absolute inset-0 rounded z-10 inline-flex items-center whitespace-nowrap overflow-hidden opacity-0 transition-opacity duration-500 before:bg-clip-text before:text-transparent after:bg-clip-text after:text-transparent before:px-2 after:px-2 before:animate-infinite-scroll after:animate-infinite-scroll"
            aria-hidden="true"
          />
        </span>
      </span>
    </button>
  )
}
