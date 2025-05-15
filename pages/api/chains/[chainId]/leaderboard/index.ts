import { NextApiRequest, NextApiResponse } from 'next'
import { getAddress } from 'viem'

import { query } from '../../../../../utils/query'

export const dynamic = 'force-dynamic'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  try {
    // eslint-disable-next-line prefer-const
    let { chainId } = req.query
    if (!chainId || typeof chainId !== 'string') {
      res.json({
        status: 'error',
        message: 'URL should be /api/chains/[chainId]/leaderboard',
      })
      return
    }

    const sql = `SELECT encode(t.origin, 'hex') AS wallet, SUM( ( (t.input_amount / POWER(10, COALESCE(meta_i.decimals, 18))) * COALESCE(meta_i.price, 0) + (t.output_amount / POWER(10, COALESCE(meta_o.decimals, 18))) * COALESCE(meta_o.price, 0) ) / 2 ) AS total_volume_usd FROM trade t LEFT JOIN token_metadata meta_i ON t.input_token = meta_i.token AND meta_i.chain_id = $1 LEFT JOIN token_metadata meta_o ON t.output_token = meta_o.token AND meta_o.chain_id = $1 GROUP BY t.origin ORDER BY total_volume_usd DESC LIMIT 1000`
    const { rows } = await query(sql, [chainId])

    return res
      .setHeader(
        'Cache-Control',
        'public, max-age=60, stale-while-revalidate=30',
      )
      .status(200)
      .json({
        results: rows.map((r: any) => ({
          wallet: getAddress('0x' + r.wallet),
          total_volume_usd: Number(r.total_volume_usd),
        })),
      })
  } catch (error) {
    console.error(error)
    res.json({
      status: 'error',
      message: 'Internal server error',
    })
  }
}
