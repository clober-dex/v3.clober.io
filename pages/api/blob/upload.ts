import { Readable } from 'stream'

import { put } from '@vercel/blob'
import { NextApiRequest, NextApiResponse } from 'next'

export const config = {
  api: {
    bodyParser: false,
  },
}

async function buffer(readable: Readable) {
  const chunks = []
  for await (const chunk of readable) {
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed')
  }

  const rawBody = await buffer(req)
  const filename = req.headers['x-filename'] as string

  if (!filename) {
    return res.status(400).json({ error: 'Missing filename header' })
  }

  const file = new File([rawBody], filename, { type: 'image/png' })

  const { url } = await put(filename, file, {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN,
  })

  return res.status(200).json({ url })
}
