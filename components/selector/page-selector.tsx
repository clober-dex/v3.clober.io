import React from 'react'
import { useRouter } from 'next/router'

import { PAGE_BUTTONS } from '../../chain-configs/page-button'
import { PageButton } from '../button/page-button'

export const PageSelector = () => {
  const router = useRouter()

  return (
    <div className="absolute right-1 md:right-[-5rem] top-4 md:top-6 z-[1500] flex flex-col bg-gray-800 border border-solid border-gray-700 rounded-xl p-5 items-start shadow-[4px_4px_12px_12px_rgba(0,0,0,0.15)]">
      <div className="flex flex-col items-start self-stretch rounded-none">
        <div className="flex flex-col gap-6 items-start self-stretch rounded-none">
          {PAGE_BUTTONS.filter((button) => button.isHiddenMenu).map((page) => (
            <div key={page.path}>
              <PageButton
                disabled={router.pathname.includes(page.path)}
                onClick={() => router.push(page.path)}
              >
                {page.icon}
                {page.label}
              </PageButton>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
