import React from 'react'
import { isAddressEqual } from 'viem'
import Image from 'next/image'

import { Currency, getLogo } from '../../model/currency'
import { Chain } from '../../model/chain'
import { WHITELISTED_CURRENCIES } from '../../constants/currency'

export const CurrencyIcon = ({
  chain,
  currency,
  ...props
}: {
  chain: Chain
  currency: Currency
} & React.ImgHTMLAttributes<HTMLImageElement>) => {
  const [tryCount, setTryCount] = React.useState(0)
  const _currency = WHITELISTED_CURRENCIES[chain.id].find((c) =>
    isAddressEqual(c.address, currency.address),
  )
  return (
    <div {...props}>
      <Image
        className="flex rounded-full"
        alt={`${chain.id}-${currency.address}`}
        src={
          _currency && _currency.icon
            ? _currency.icon
            : getLogo(chain, currency)
        }
        width={32}
        height={32}
        onError={(e) => {
          if (chain.testnet || tryCount >= 1) {
            e.currentTarget.src = '/unknown.svg'
            return
          } else {
            e.currentTarget.src = chain
              ? `https://dd.dexscreener.com/ds-data/tokens/${
                  chain.name
                }/${currency.address.toLowerCase()}.png?size=lg`
              : '/unknown.svg'
            setTryCount((count) => count + 1)
          }
        }}
      />
    </div>
  )
}
