import { Chain } from '../model/chain'
import { Currency } from '../model/currency'

export type ChainConfig = {
  CHAIN: Chain
  GOOGLE_ANALYTICS_TRACKING_ID: string
  RPC_URL: string
  PYTH_HERMES_ENDPOINT: string
  EXTERNAL_CONTRACT_ADDRESSES: {
    [contractName: string]: `0x${string}`
  }
  EXTERNAL_SUBGRAPH_ENDPOINTS: {
    [endpointName: string]: string
  }
  WHITELISTED_VAULT_KEYS: `0x${string}`[]
  REFERENCE_CURRENCY: Currency
  DEFAULT_INPUT_CURRENCY: Currency
  WHITELISTED_CURRENCIES: Currency[]
}
