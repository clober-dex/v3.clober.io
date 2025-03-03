import { createPublicClient, Hash, http, WalletClient } from 'viem'
import { CHAIN_IDS, Transaction } from '@clober/v2-sdk'

import { supportChains } from '../constants/chain'
import { RPC_URL } from '../constants/rpc-urls'
import { Chain } from '../model/chain'

import { currentTimestampInSeconds } from './date'

export const WALLET_WARNING_MODAL_START_TIMESTAMP =
  'wallet-warning-modal-start-timestamp'

export async function sendTransaction(
  chain: Chain,
  walletClient: WalletClient,
  transaction: Transaction,
  disconnectAsync: () => Promise<void>,
): Promise<Hash | undefined> {
  if (!walletClient) {
    return
  }
  if (disconnectAsync && chain.id !== walletClient.chain!.id) {
    localStorage.setItem(
      WALLET_WARNING_MODAL_START_TIMESTAMP,
      currentTimestampInSeconds().toString(),
    )
    localStorage.removeItem('wagmi.cache')
    await disconnectAsync()
  }
  const publicClient = createPublicClient({
    chain: supportChains.find((chain) => chain.id === walletClient.chain!.id),
    transport: http(RPC_URL[walletClient.chain!.id]),
  })
  try {
    const hash = await walletClient.sendTransaction({
      data: transaction.data,
      to: transaction.to,
      value: transaction.value,
      gas: transaction.gas,
      account: walletClient.account!,
      chain,
    })
    await publicClient.waitForTransactionReceipt({ hash })
    return hash
  } catch (e) {
    console.error('Failed to send transaction', e)
    throw e
  }
}

export async function waitTransaction(
  chainId: CHAIN_IDS,
  hash: Hash,
): Promise<void> {
  const publicClient = createPublicClient({
    chain: supportChains.find((chain) => chain.id === chainId),
    transport: http(RPC_URL[chainId]),
  })
  await publicClient.waitForTransactionReceipt({ hash })
}
