import React, { useState } from 'react'
import { createPortal } from 'react-dom'

import { Currency } from '../../model/currency'
import { CurrencyIcon } from '../icon/currency-icon'
import { ClipboardSvg } from '../svg/clipboard-svg'
import { Toast } from '../toast'
import { handleCopyClipBoard } from '../../utils/string'
import { ActionButton } from '../button/action-button'
import { shortAddress } from '../../utils/address'
import { Chain } from '../../model/chain'
import { CHAIN_CONFIG } from '../../chain-configs'

const InspectCurrencyModal = ({
  chain,
  currency,
  onCurrencySelect,
  setInspectingCurrency,
  explorerUrl,
}: {
  chain: Chain
  currency: Currency | undefined
  onCurrencySelect: (currency: Currency) => void
  setInspectingCurrency: (currency: Currency | undefined) => void
  explorerUrl: string
}) => {
  const [isCopyToast, setIsCopyToast] = useState(false)

  if (!currency) {
    return <></>
  }
  explorerUrl = `${explorerUrl}/address/${currency.address}`

  return createPortal(
    <>
      <Toast
        isCopyToast={isCopyToast}
        setIsCopyToast={setIsCopyToast}
        durationInMs={1300}
      >
        <div className="w-[240px] items-center justify-center flex flex-row gap-1.5 text-white text-sm font-semibold">
          <ClipboardSvg />
          Address copied to clipboard
        </div>
      </Toast>

      <div
        className="flex items-center justify-center fixed inset-0 bg-black bg-opacity-50 z-[1000] backdrop-blur-sm px-4 sm:px-0"
        onClick={(e) => {
          e.stopPropagation()
          setInspectingCurrency(undefined)
        }}
      >
        <div
          className="flex flex-col w-full sm:w-[480px] h-auto bg-gray-900 text-white rounded-xl sm:rounded-2xl px-6 pb-6 gap-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex-col pt-6 pb-2 items-center justify-center gap-6 box-border">
            <div className="flex items-center">
              <div
                className="flex w-6 h-6 p-[3px] justify-center items-center shrink-0 cursor-pointer"
                onClick={() => setInspectingCurrency(undefined)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                >
                  <path
                    d="M12 16.5L4.5 9L12 1.5"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="square"
                  />
                </svg>
              </div>
              <div className="flex justify-center items-center flex-grow">
                <div className="text-white text-center text-xl font-bold">
                  Import a token
                </div>
              </div>
              <div className="flex w-6 h-6 p-[3px] justify-center items-center shrink-0" />
            </div>
          </div>
          <button
            key={currency.address}
            className="flex w-full pt-3 items-center justify-start text-start rounded-lg"
          >
            <div className="flex items-center gap-3">
              <CurrencyIcon
                chain={chain}
                currency={currency}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-col justify-center items-start gap-[2px]">
                <div className="flex items-center gap-1">
                  <div className="text-sm sm:text-base font-bold text-white">
                    {currency.symbol}
                  </div>
                  {!currency.isVerified ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M8.9073 4.41123C9.38356 3.55396 10.6164 3.55396 11.0927 4.41122L16.6937 14.493C17.1565 15.3261 16.5541 16.35 15.601 16.35H4.39903C3.44592 16.35 2.84346 15.3261 3.30633 14.493L8.9073 4.41123Z"
                        stroke="#FACC15"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M10 9V10.8"
                        stroke="#FACC15"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <circle cx="9.99961" cy="13.5" r="0.9" fill="#FACC15" />
                    </svg>
                  ) : (
                    <></>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {currency.name}
                </div>
              </div>
            </div>
          </button>
          <div className="flex px-3 py-2 justify-center items-center gap-2 rounded-lg bg-gray-800 self-start">
            <span className="text-white text-sm hidden sm:flex">
              {currency.address}
            </span>
            <span className="text-white text-sm flex sm:hidden">
              {shortAddress(currency.address)}
            </span>
            <a href={explorerUrl} target="_blank" rel="noreferrer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M8.00033 3.99996H4.00033C3.6467 3.99996 3.30756 4.14044 3.05752 4.39048C2.80747 4.64053 2.66699 4.97967 2.66699 5.33329V12C2.66699 12.3536 2.80747 12.6927 3.05752 12.9428C3.30756 13.1928 3.6467 13.3333 4.00033 13.3333H10.667C11.0206 13.3333 11.3598 13.1928 11.6098 12.9428C11.8598 12.6927 12.0003 12.3536 12.0003 12V7.99996M7.33366 8.66663L13.3337 2.66663M13.3337 2.66663H10.0003M13.3337 2.66663V5.99996"
                  stroke="#9CA3AF"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <button
              onClick={async () => {
                await handleCopyClipBoard(currency.address)
                setIsCopyToast(true)
              }}
              className="cursor-pointer justify-center items-center gap-0.5 flex"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M2.67467 11.158C2.47023 11.0415 2.30018 10.873 2.18172 10.6697C2.06325 10.4663 2.00057 10.2353 2 10V4.33333C2 2.66667 3 2 4.33333 2L10 2C10.5 2 10.772 2.25667 11 2.66667M4.66667 6.44467C4.66667 5.97311 4.85399 5.52087 5.18743 5.18743C5.52087 4.85399 5.97311 4.66667 6.44467 4.66667H12.222C12.4555 4.66667 12.6867 4.71266 12.9024 4.80201C13.1181 4.89136 13.3141 5.02233 13.4792 5.18743C13.6443 5.35253 13.7753 5.54854 13.8647 5.76426C13.954 5.97997 14 6.21118 14 6.44467V12.222C14 12.4555 13.954 12.6867 13.8647 12.9024C13.7753 13.1181 13.6443 13.3141 13.4792 13.4792C13.3141 13.6443 13.1181 13.7753 12.9024 13.8647C12.6867 13.954 12.4555 14 12.222 14H6.44467C6.21118 14 5.97997 13.954 5.76426 13.8647C5.54854 13.7753 5.35253 13.6443 5.18743 13.4792C5.02233 13.3141 4.89136 13.1181 4.80201 12.9024C4.71266 12.6867 4.66667 12.4555 4.66667 12.222V6.44467Z"
                  stroke="#9CA3AF"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <div className="flex-col p-4 items-center gap-4 bg-gray-800 rounded-lg self-stretch text-white text-sm break-all">
            This token isn’t officially listed by {CHAIN_CONFIG.DEX_NAME}.
            Anyone can create any token, including fake versions of the existing
            tokens. Take due care. Some tokens and their technical parameters
            may be incompatible with {CHAIN_CONFIG.DEX_NAME} services. Always
            conduct your own research before trading. By importing this custom
            token you acknowledge and accept the risks.
          </div>
          <ActionButton
            disabled={false}
            onClick={() => onCurrencySelect(currency)}
            text="Accept and confirm"
          />
          <div
            className="text-gray-400 text-center text-base font-semibold cursor-pointer"
            onClick={() => setInspectingCurrency(undefined)}
          >
            Cancel
          </div>
        </div>
      </div>
    </>,
    document.body,
  )
}

export default InspectCurrencyModal
