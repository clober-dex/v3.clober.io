import React, { useEffect } from 'react'
import { isAddressEqual } from 'viem'
import Image from 'next/image'

import { Currency, getLogo } from '../../model/currency'
import { Chain } from '../../model/chain'
import { WHITELISTED_CURRENCIES } from '../../constants/currency'

export const CurrencyIconBase = ({
  chain,
  currency,
  unoptimized,
  ...props
}: {
  chain: Chain
  currency: Currency
  unoptimized?: boolean
} & React.ImgHTMLAttributes<HTMLImageElement>) => {
  const [tryCount, setTryCount] = React.useState(0)
  const _currency = WHITELISTED_CURRENCIES[chain.id].find((c) =>
    isAddressEqual(c.address, currency.address),
  )

  const [src, setSrc] = React.useState<string | null>(null)
  const handleError = () => {
    if (tryCount === 0 && !chain.testnet) {
      setSrc(
        chain
          ? `https://dd.dexscreener.com/ds-data/tokens/${chain.name}/${currency.address.toLowerCase()}.png?size=lg`
          : '/unknown.svg',
      )
      setTryCount(1)
    } else {
      setSrc('/unknown.svg')
    }
  }

  useEffect(() => {
    setSrc(_currency?.icon ?? getLogo(chain, currency))
  }, [_currency?.icon, chain, currency, src])

  return (
    <div {...props}>
      {src && (
        <Image
          unoptimized={unoptimized ? true : undefined}
          priority={unoptimized ? true : undefined}
          className="flex rounded-full"
          alt={`${chain.id}-${currency.address}`}
          src={src}
          width={32}
          height={32}
          onError={handleError}
        />
      )}
    </div>
  )
}

export const CurrencyIcon = React.memo(
  CurrencyIconBase,
  (prev, next) =>
    prev.chain.id === next.chain.id &&
    isAddressEqual(prev.currency.address, next.currency.address),
)
