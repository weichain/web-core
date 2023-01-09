import { isHexString, toUtf8String } from 'ethers/lib/utils'
import { SafeAppAccessPolicyTypes } from '@safe-global/safe-gateway-typescript-sdk'
import type { BaseTransaction, ChainInfo } from '@gnosis.pm/safe-apps-sdk'
import { formatVisualAmount } from '@/utils/formatters'
import { validateAddress } from '@/utils/validation'
import type { SafeAppDataWithPermissions } from './types'

const validateTransaction = (t: BaseTransaction): boolean => {
  if (!['string', 'number'].includes(typeof t.value)) {
    return false
  }

  if (typeof t.value === 'string' && !/^(0x)?[0-9a-f]+$/i.test(t.value)) {
    return false
  }

  const isAddressValid = validateAddress(t.to) === undefined
  return isAddressValid && !!t.data && typeof t.data === 'string'
}

export const isTxValid = (txs: BaseTransaction[]) => txs.length && txs.every((t) => validateTransaction(t))

export const getInteractionTitle = (value?: string, chain?: ChainInfo) => {
  const { decimals, symbol } = chain!.nativeCurrency
  return `Interact with${
    Number(value) !== 0 ? ` (and send ${formatVisualAmount(value || 0, decimals)} ${symbol} to)` : ''
  }:`
}

/**
 * If message is a hex value and is Utf8 encoded string we decode it, else we return the raw message
 * @param {string} message raw input message
 * @returns {string}
 */
export const getDecodedMessage = (message: string): string => {
  if (isHexString(message)) {
    // If is a hex string we try to extract a message
    try {
      return toUtf8String(message)
    } catch (e) {
      // the hex string is not UTF8 encoding so we will return the raw message.
    }
  }

  return message
}

export const getLegacyChainName = (chainName: string, chainId: string): string => {
  let network = chainName

  switch (chainId) {
    case '1':
      network = 'MAINNET'
      break
    case '100':
      network = 'XDAI'
  }

  return network
}

export const getEmptySafeApp = (url = ''): SafeAppDataWithPermissions => {
  return {
    id: Math.random(),
    url,
    name: 'unknown',
    iconUrl: '/images/apps/apps-icon.svg',
    description: '',
    chainIds: [],
    accessControl: {
      type: SafeAppAccessPolicyTypes.NoRestrictions,
    },
    tags: [],
    safeAppsPermissions: [],
  }
}

export const getOrigin = (url?: string): string => {
  if (!url) return ''

  const { origin } = new URL(url)

  return origin
}
