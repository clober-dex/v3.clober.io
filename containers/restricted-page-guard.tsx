import React, { useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'

import { PAGE_BUTTONS } from '../chain-configs/page-button'

const RestrictedPageGuard = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const find = useMemo(
    () => PAGE_BUTTONS.find((page) => page.path === router.pathname),
    [router.pathname],
  )
  useEffect(() => {
    if (!find) {
      router.replace('/')
    }
  }, [find, router])

  return <>{find ? children : null}</>
}

export default RestrictedPageGuard
