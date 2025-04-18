import React from 'react'
import { useRouter } from 'next/router'
import { monadTestnet } from 'viem/chains'

import { useChainContext } from '../contexts/chain-context'

export default function Home() {
  const router = useRouter()
  const { selectedChain } = useChainContext()
  if (router.pathname === '/') {
    if (selectedChain.id === monadTestnet.id) {
      router.push('/trading-competition')
    } else {
      router.push('/trade')
    }
  }
  return <></>
}
