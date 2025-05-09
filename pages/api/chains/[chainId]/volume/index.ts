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
    let { chainId, token } = req.query
    if (
      !chainId ||
      typeof chainId !== 'string' ||
      !token ||
      typeof token !== 'string'
    ) {
      return res.status(400).json({
        status: 'error',
        message: 'URL should be /api/chains/[chainId]/volume?token=[token]',
      })
    }
    if (!isAddress(token)) {
      res.json({
        status: 'error',
        message: 'Invalid address',
      })
      return
    }

    const sql = `SELECT encode(t.origin, 'hex') AS wallet, SUM( CASE WHEN t.input_token = $2 THEN t.input_amount WHEN t.output_token = $2 THEN t.output_amount ELSE 0 END ) AS raw_volume, MAX(COALESCE(meta.decimals, 18)) AS decimals FROM trade t LEFT JOIN token_metadata meta ON meta.token = $2 AND meta.chain_id = $1 WHERE (t.input_token = $2 OR t.output_token = $2) GROUP BY t.origin HAVING SUM( CASE WHEN t.input_token = $2 THEN t.input_amount WHEN t.output_token = $2 THEN t.output_amount ELSE 0 END ) > 0 ORDER BY raw_volume DESC`
    const { rows } = await query(sql, [
      chainId,
      Buffer.from(token.slice(2), 'hex'),
    ])

    return res
      .setHeader(
        'Cache-Control',
        'public, max-age=60, stale-while-revalidate=30',
      )
      .status(200)
      .json({
        results: rows.map((r: any) => {
          return {
            wallet: getAddress('0x' + r.wallet),
            total_volume_base: r.raw_volume,
          }
        }),
      })
  } catch (error) {
    console.error(error)
    res.json({
      status: 'error',
      message: 'Internal server error',
    })
  }
}
