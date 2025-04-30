import React from 'react'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()
  if (router.pathname === '/') {
    router.push('/trade')
  }
  return <></>
}
