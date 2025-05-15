import { Chain, monadTestnet } from 'viem/chains'
import { getAddress } from 'viem'
import { NextApiRequest, NextApiResponse } from 'next'

import { fetchPricesFromPyth } from '../../../apis/price'
import {
  PRICE_FEED_ID_LIST,
  WHITELISTED_CURRENCIES,
} from '../../../constants/currency'
import { fetchPrices } from '../../../apis/swap/price'
import { Prices } from '../../../model/prices'
import { query } from '../../../utils/query'

const BLACKLISTED_TOKENS: `0x${string}`[] = [
  '0x836047a99e11f376522b447bffb6e3495dd0637c',
  '0xA296f47E8Ff895Ed7A092b4a9498bb13C46ac768',
  '0xB5a30b0FDc5EA94A52fDc42e3E9760Cb8449Fb37',
]

export const dynamic = 'force-dynamic'

export default async function handler(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  req: NextApiRequest,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  res: NextApiResponse,
) {
  try {
    const chains: Chain[] = [monadTestnet]
    const blacklisted = new Set(BLACKLISTED_TOKENS.map(getAddress))

    for (const chain of chains) {
      const chainId = chain.id

      const priceMap = (
        await Promise.all([
          fetchPricesFromPyth(chainId, PRICE_FEED_ID_LIST[chainId]),
          fetchPrices(),
        ])
      ).reduce((acc, price) => ({ ...acc, ...price }), {} as Prices)

      const filteredPriceMap = Object.fromEntries(
        Object.entries(priceMap).filter(
          ([token]) => !blacklisted.has(getAddress(token)),
        ),
      )

      const whitelist = WHITELISTED_CURRENCIES[chainId] || []
      const updates: { token: Buffer; price: number; decimals: number }[] = []

      for (const token of whitelist) {
        const addr = getAddress(token.address)
        const price = filteredPriceMap[addr]
        if (!price) {
          continue
        }

        updates.push({
          token: Buffer.from(addr.replace(/^0x/, ''), 'hex'),
          price,
          decimals: token.decimals,
        })
      }

      for (const { token, price, decimals } of updates) {
        await query(
          `INSERT INTO token_metadata (token, chain_id, price, decimals) VALUES ($1, $2, $3, $4) ON CONFLICT (token, chain_id) DO UPDATE SET price = EXCLUDED.price, decimals = EXCLUDED.decimals`,
          [token, chainId, price, decimals],
        )
      }

      console.log(
        `[cron] updated ${updates.length} tokens for chain ${chainId}`,
      )
    }

    res.status(200).json({ status: 'ok' })
  } catch (err) {
    console.error('[cron] update-token-metadata failed:', err)
    res.status(500).json({ status: 'failed', error: err })
  }
}
