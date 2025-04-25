import React, { useCallback, useEffect, useMemo, useState } from 'react'
import '../styles/globals.css'
import '@rainbow-me/rainbowkit/styles.css'
import { darkTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import Head from 'next/head'
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from '@tanstack/react-query'
import type { AppProps } from 'next/app'
import { WagmiProvider } from 'wagmi'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { Analytics } from '@vercel/analytics/next'
import { monadTestnet } from 'viem/chains'
import Script from 'next/script'

import HeaderContainer from '../containers/header-container'
import { ChainProvider, useChainContext } from '../contexts/chain-context'
import { MarketProvider } from '../contexts/trade/market-context'
import { getChain, getClientConfig } from '../constants/chain'
import {
  TransactionProvider,
  useTransactionContext,
} from '../contexts/transaction-context'
import { OpenOrderProvider } from '../contexts/trade/open-order-context'
import { LimitContractProvider } from '../contexts/trade/limit-contract-context'
import Panel from '../components/panel'
import ErrorBoundary from '../components/error-boundary'
import { CurrencyProvider } from '../contexts/currency-context'
import Footer from '../components/footer'
import { TradeProvider } from '../contexts/trade/trade-context'
import { SwapContractProvider } from '../contexts/trade/swap-contract-context'
import { VaultProvider } from '../contexts/vault/vault-context'
import { VaultContractProvider } from '../contexts/vault/vault-contract-context'
import { FuturesProvider } from '../contexts/futures/futures-context'
import { FuturesContractProvider } from '../contexts/futures/futures-contract-context'
import { PointProvider } from '../contexts/point-context'
import { GOOGLE_ANALYTICS_TRACKING_ID } from '../constants/google-analytics'

const CacheProvider = ({ children }: React.PropsWithChildren) => {
  const queryClient = useQueryClient()

  useEffect(() => {
    localStorage.removeItem('wagmi.cache')
  }, [queryClient])

  return <>{children}</>
}

const queryClient = new QueryClient()
const WalletProvider = ({ children }: React.PropsWithChildren) => {
  const [clientReady, setClientReady] = useState(false)
  const [clientConfig, setClientConfig] = useState<any | null>(null)

  useEffect(() => {
    const config = getClientConfig()
    if (config) {
      setClientConfig(config)
      setClientReady(true)
    }
  }, [])

  if (!clientReady || !clientConfig) {
    return null
  }

  return (
    <WagmiProvider config={clientConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          <CacheProvider>{children}</CacheProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

const TradeProvidersWrapper = ({ children }: React.PropsWithChildren) => {
  return (
    <OpenOrderProvider>
      <LimitContractProvider>
        <SwapContractProvider>
          <TradeProvider>
            <MarketProvider>{children}</MarketProvider>
          </TradeProvider>
        </SwapContractProvider>
      </LimitContractProvider>
    </OpenOrderProvider>
  )
}

const VaultProvidersWrapper = ({ children }: React.PropsWithChildren) => {
  return (
    <VaultProvider>
      <VaultContractProvider>{children}</VaultContractProvider>
    </VaultProvider>
  )
}

const FuturesProvidersWrapper = ({ children }: React.PropsWithChildren) => {
  return (
    <FuturesProvider>
      <FuturesContractProvider>{children}</FuturesContractProvider>
    </FuturesProvider>
  )
}

const PanelWrapper = ({
  open,
  setOpen,
  children,
}: {
  open: boolean
  setOpen: (open: boolean) => void
} & React.PropsWithChildren) => {
  const router = useRouter()
  const { selectedChain } = useChainContext()

  return (
    <Panel
      chainId={selectedChain.id}
      open={open}
      setOpen={setOpen}
      router={router}
    >
      {children}
    </Panel>
  )
}

const FooterWrapper = () => {
  const { latestSubgraphBlockNumber } = useTransactionContext()
  return (
    <Footer latestSubgraphBlockNumber={latestSubgraphBlockNumber.blockNumber} />
  )
}

function App({ Component, pageProps }: AppProps) {
  const [open, setOpen] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const router = useRouter()

  const handlePopState = useCallback(async () => {
    if (history.length > 1) {
      setHistory((previous) => previous.slice(0, previous.length - 1))
      router.push(history[history.length - 2])
    }
  }, [history, router])

  useEffect(() => {
    setHistory((previous) => [...previous, router.asPath])
  }, [router.asPath])

  useEffect(() => {
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [handlePopState])

  const chain = useMemo(() => getChain(), [])

  // Tally script
  useEffect(() => {
    if (chain.id === monadTestnet.id) {
      const script = document.createElement('script')
      script.src = 'https://tally.so/widgets/embed.js'
      script.defer = true
      document.body.appendChild(script)

      script.onload = () => {
        if ((window as any).Tally) {
          ;(window as any).Tally.openPopup('3qgBN2', {
            layout: 'modal',
            width: 500,
            overlay: true,
            doNotShowAfterSubmit: true,
          })
        }
      }
    }
  }, [chain.id])

  const getBackground = (pathname: string) => {
    if (pathname.includes('/trade')) {
      return "lg:bg-[url('../public/trade-background.png')] lg:bg-top"
    } else if (pathname.includes('/earn')) {
      return "bg-[url('../public/base-background.png')] bg-top"
    } else if (pathname.includes('/futures')) {
      return "bg-[url('../public/base-background.png')] bg-top"
    } else if (pathname.includes('/discover')) {
      return "lg:bg-[url('../public/base-background.png')] bg-top"
    } else if (pathname.includes('/point')) {
      return "sm:bg-[url('../public/base-background.png')] bg-top"
    } else if (pathname.includes('/trading-competition')) {
      return "sm:bg-[url('../public/trading-competition-background.png')] bg-top"
    }
  }

  return (
    <>
      {GOOGLE_ANALYTICS_TRACKING_ID[chain.id] && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_TRACKING_ID[chain.id]}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '${GOOGLE_ANALYTICS_TRACKING_ID[chain.id]}');
        `}
          </Script>
        </>
      )}

      <ErrorBoundary>
        <Head>
          <title>Clober | Fully On-chain Order Book</title>
          <link rel="apple-touch-icon" href="/favicon.png" />
          <link rel="icon" type="image/png" href="/favicon.png" />
        </Head>
        <WalletProvider>
          <ChainProvider>
            <TransactionProvider>
              <CurrencyProvider>
                <PointProvider>
                  <div
                    className={`flex flex-col w-[100vw] min-h-[100vh] bg-[#0F1013] text-white ${getBackground(
                      router.pathname,
                    )} bg-right bg-no-repeat`}
                  >
                    <PanelWrapper open={open} setOpen={setOpen} />
                    <HeaderContainer onMenuClick={() => setOpen(true)} />

                    {router.pathname.includes('/trade') ? (
                      <TradeProvidersWrapper>
                        <div className="flex flex-1 relative justify-center">
                          <div className="flex w-full flex-col items-center gap-6 md:gap-11 px-2 pb-0 mt-[30px] md:mt-[56px]">
                            <Component {...pageProps} />
                          </div>
                        </div>
                      </TradeProvidersWrapper>
                    ) : router.pathname.includes('/earn') ? (
                      <VaultProvidersWrapper>
                        <div className="flex flex-1 relative justify-center">
                          <div className="flex w-full flex-col items-center gap-6 md:gap-11 px-2 pb-0">
                            <Component {...pageProps} />
                          </div>
                        </div>
                      </VaultProvidersWrapper>
                    ) : router.pathname.includes('/futures') ? (
                      <FuturesProvidersWrapper>
                        <div className="flex flex-1 relative justify-center">
                          <div className="flex w-full flex-col items-center gap-6 md:gap-11 px-2 pb-0">
                            <Component {...pageProps} />
                          </div>
                        </div>
                      </FuturesProvidersWrapper>
                    ) : (
                      <TradeProvidersWrapper>
                        <div className="flex flex-1 relative justify-center">
                          <div className="flex w-full flex-col items-center gap-6 md:gap-11 px-2 pb-0 mt-[30px] md:mt-[56px]">
                            <Component {...pageProps} />
                          </div>
                        </div>
                      </TradeProvidersWrapper>
                    )}

                    <FooterWrapper />
                  </div>
                </PointProvider>
              </CurrencyProvider>
            </TransactionProvider>
          </ChainProvider>
        </WalletProvider>
      </ErrorBoundary>
      <Analytics />
    </>
  )
}

export default dynamic(() => Promise.resolve(App), {
  ssr: false,
})
