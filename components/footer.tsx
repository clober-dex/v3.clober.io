import React from 'react'

import { BlockNumberWidget } from './block-number-widget'

const Footer = ({
  latestSubgraphBlockNumber,
}: {
  latestSubgraphBlockNumber: number
}) => {
  return (
    <>
      <div className="flex h-8 justify-between items-center px-4 text-xs text-gray-500 bg-gray-950">
        <div className="flex items-center">
          Support:{' '}
          <a
            href="mailto:official@clober.io"
            className="text-gray-500 hover:text-blue-500"
          >
            official@clober.io
          </a>
        </div>
        <a
          className="flex w-auto ml-auto"
          target="_blank"
          href="https://clober.io/?utm_source=app_page&utm_medium=app_page"
          rel="noopener"
        >
          Powered by Clober (v
          {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7)})
        </a>
      </div>
      <BlockNumberWidget latestBlockNumber={latestSubgraphBlockNumber} />
    </>
  )
}

export default Footer
