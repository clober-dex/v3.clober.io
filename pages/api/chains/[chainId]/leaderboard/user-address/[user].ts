import { NextApiRequest, NextApiResponse } from 'next'
import { Pool } from 'pg'
import { getAddress, isAddress } from 'viem'

const pool = new Pool({ connectionString: process.env.POSTGRES_URL })

async function query(text: string, params?: any[]) {
  const client = await pool.connect()
  try {
    return client.query(text, params)
  } finally {
    client.release()
  }
}

export const dynamic = 'force-dynamic'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  try {
    // eslint-disable-next-line prefer-const
    let { chainId, user } = req.query
    if (
      !chainId ||
      !user ||
      typeof chainId !== 'string' ||
      typeof user !== 'string'
    ) {
      res.json({
        status: 'error',
        message: 'URL should be /api/chains/[chainId]/user-address/[user]',
      })
      return
    }
    if (!isAddress(user)) {
      res.json({
        status: 'error',
        message: 'Invalid address',
      })
      return
    }
    const hexAddress = getAddress(user).toLowerCase().replace(/^0x/, '')

    const sql = `WITH ranked AS ( SELECT encode(t.origin, 'hex') AS wallet, SUM( ( (t.input_amount / POWER(10, COALESCE(meta_i.decimals, 18))) * COALESCE(meta_i.price, 0) + (t.output_amount / POWER(10, COALESCE(meta_o.decimals, 18))) * COALESCE(meta_o.price, 0) ) / 2 ) AS total_volume_usd, RANK() OVER ( ORDER BY SUM( ( (t.input_amount / POWER(10, COALESCE(meta_i.decimals, 18))) * COALESCE(meta_i.price, 0) + (t.output_amount / POWER(10, COALESCE(meta_o.decimals, 18))) * COALESCE(meta_o.price, 0) ) / 2 ) DESC ) AS rank FROM trade t LEFT JOIN token_metadata meta_i ON t.input_token = meta_i.token AND meta_i.chain_id = $1 LEFT JOIN token_metadata meta_o ON t.output_token = meta_o.token AND meta_o.chain_id = $1 GROUP BY t.origin ) SELECT * FROM ranked WHERE wallet = $2;`

    const { rows } = await query(sql, [chainId, hexAddress])

    if (rows.length === 0) {
      return res.status(200).json({ my_rank: null })
    }

    const row = rows[0]
    const myRank = {
      wallet: getAddress('0x' + row.wallet),
      total_volume_usd: Number(row.total_volume_usd),
      rank: Number(row.rank),
    }

    return res
      .setHeader(
        'Cache-Control',
        'public, max-age=60, stale-while-revalidate=30',
      )
      .status(200)
      .json({ my_rank: myRank })
  } catch (error) {
    console.error(error)
    res.json({
      status: 'error',
      message: 'Internal server error',
    })
  }
}
