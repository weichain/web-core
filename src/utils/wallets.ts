import { ProviderLabel } from '@web3-onboard/injected-wallets'
import { hasValidPairingSession } from '@/services/pairing/utils'
import { PAIRING_MODULE_LABEL } from '@/services/pairing/module'
import { E2E_WALLET_NAME } from '@/tests/e2e-wallet'
import type { EthersError } from '@/utils/ethers-utils'
import { ErrorCode } from '@ethersproject/logger'

const isWCRejection = (err: Error): boolean => {
  return /rejected/.test(err?.message)
}

const isEthersRejection = (err: EthersError): boolean => {
  return err.code === ErrorCode.ACTION_REJECTED
}

export const isWalletRejection = (err: EthersError): boolean => {
  return isEthersRejection(err) || isWCRejection(err)
}

export const WalletNames = {
  METAMASK: ProviderLabel.MetaMask,
  WALLET_CONNECT: 'WalletConnect',
  SAFE_MOBILE_PAIRING: PAIRING_MODULE_LABEL,
}

/* Check if the wallet is unlocked. */
export const isWalletUnlocked = async (walletName: string): Promise<boolean> => {
  if (typeof window === 'undefined') return false

  // Only MetaMask exposes a method to check if the wallet is unlocked
  if (walletName === WalletNames.METAMASK) {
    return window.ethereum?._metamask?.isUnlocked?.() || false
  }

  // Wallet connect creates a localStorage entry when connected and removes it when disconnected
  if (walletName === WalletNames.WALLET_CONNECT) {
    return window.localStorage.getItem('walletconnect') !== null
  }

  // Our own Safe mobile pairing module
  if (walletName === WalletNames.SAFE_MOBILE_PAIRING && hasValidPairingSession()) {
    return hasValidPairingSession()
  }

  if (walletName === E2E_WALLET_NAME) {
    return Boolean(window.Cypress)
  }

  return false
}
