import React from 'react'

import { Chain } from '../../model/chain'
import { CHAIN_CONFIG } from '../../chain-configs'

export default function ChainIcon({
  chain,
  ...props
}: React.BaseHTMLAttributes<HTMLDivElement> & {
  chain: Chain
}) {
  const name = chain.name.toLowerCase().split(' ')[0]
  const defaultIcon = CHAIN_CONFIG.CHAIN.icon
  return (
    <div {...props}>
      <img
        src={chain.icon || `https://assets.odos.xyz/chains/${name}.png`}
        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
          e.currentTarget.onerror = null
          // @ts-ignore
          e.currentTarget.src = defaultIcon
        }}
        alt="ChainIcon"
        className="w-full h-full object-contain rounded-full"
      />
    </div>
  )
}
