import React, { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()
  useEffect(() => {
    if (router.pathname === '/') {
      const search = window.location.search
      router.replace({
        pathname: '/trade',
        search,
      } as any)
    }
  }, [router])

  return <></>
}
