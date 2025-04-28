import React from 'react'
import { GetServerSideProps } from 'next'
import Head from 'next/head'

export default function PreviewPage({ imageUrl }: { imageUrl: string }) {
  return (
    <>
      <Head>
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Check out my trading performance!" />
        <meta
          property="og:description"
          content="Shared from Trading Competition"
        />
        <meta property="og:image" content={imageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={imageUrl} />
        <title>Trading Competition Share</title>
      </Head>

      <div className="flex justify-center items-center min-h-screen bg-black">
        <img
          src={imageUrl}
          alt="Shared PnL"
          className="max-w-full max-h-full"
        />
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { file } = context.params || {}

  const imageUrl = `https://dsh983ondhzmdpjk.public.blob.vercel-storage.com/${file}`

  return {
    props: {
      imageUrl,
    },
  }
}
