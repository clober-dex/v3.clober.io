import React, { useEffect, useState } from 'react'
import { isAddressEqual } from 'viem'
import Image from 'next/image'

import { Currency } from '../../model/currency'
import { Chain } from '../../model/chain'
import { CHAIN_CONFIG } from '../../chain-configs'

type CurrencyIconProps = {
  chain: Chain
  currency: Currency
  unoptimized?: boolean
} & React.HTMLAttributes<HTMLDivElement>

function getLogo(chain: Chain, currency?: Currency): string {
  if (!currency || chain.testnet) {
    return '/unknown.svg'
  }
  if (currency.icon) {
    return currency.icon
  }
  return `https://assets.odos.xyz/tokens/${encodeURIComponent(
    currency.symbol,
  )}.webp`
}

const CurrencyIconBase = ({
  chain,
  currency,
  unoptimized,
  ...props
}: CurrencyIconProps) => {
  const _currency = CHAIN_CONFIG.WHITELISTED_CURRENCIES.find((c) =>
    isAddressEqual(c.address, currency.address),
  )

  const defaultSrc = _currency?.icon ?? getLogo(chain, currency)
  const [src, setSrc] = useState(defaultSrc)
  const [tryCount, setTryCount] = useState(0)

  useEffect(() => {
    setSrc(defaultSrc)
    setTryCount(0)
  }, [defaultSrc])

  const handleError = () => {
    if (tryCount === 0 && !chain.testnet) {
      setSrc(
        `https://dd.dexscreener.com/ds-data/tokens/${chain.name}/${currency.address.toLowerCase()}.png?size=lg`,
      )
      setTryCount(1)
    } else {
      setSrc('/unknown.svg')
    }
  }

  return (
    <div {...props}>
      <Image
        unoptimized={unoptimized}
        priority={unoptimized}
        className="flex rounded-full"
        alt={`${chain.id}-${currency.address}`}
        src={src}
        width={32}
        height={32}
        onError={handleError}
      />
    </div>
  )
}

export const CurrencyIcon = React.memo(
  CurrencyIconBase,
  (prev, next) =>
    prev.chain.id === next.chain.id &&
    isAddressEqual(prev.currency.address, next.currency.address) &&
    prev.className === next.className &&
    JSON.stringify(prev.style) === JSON.stringify(next.style),
)
