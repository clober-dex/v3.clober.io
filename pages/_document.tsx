import React from 'react'
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta
          name="description"
          content="Join Clober DEX and Start Trading on a Fully On-chain Order Book. Eliminate Counterparty Risk. Place Limit Orders. Low Transaction Costs Powered by LOBSTER."
        />

        {/* <!-- Facebook Meta Tags --> */}
        <meta property="og:url" content="https://app.clober.io/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Trade | Clober DEX" />
        <meta
          property="og:description"
          content="Fully On-chain Order Book for EVM"
        />
        <meta
          property="og:image"
          content="https://app.clober.io/twitter-card-v2.png"
        />
        {/* <!-- Twitter Meta Tags --> */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:site" content="@CloberDEX" />
        <meta property="twitter:title" content="Trade | Clober DEX" />
        <meta
          property="twitter:description"
          content="Fully On-chain Order Book for EVM."
        />
        <meta
          name="twitter:image"
          content="https://app.clober.io/twitter-card.png"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
