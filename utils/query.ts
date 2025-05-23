import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.POSTGRES_URL })

export async function query(text: string, params?: any[]) {
  const client = await pool.connect()
  try {
    return client.query(text, params)
  } finally {
    client.release()
  }
}
