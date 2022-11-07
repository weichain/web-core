/* eslint-disable prettier/prettier */
import { useEffect, useMemo } from 'react'
import type { BigNumber } from 'ethers'
import type Safe from '@weichain/safe-core-sdk'
import { encodeSignatures } from '@/services/tx/encodeSignatures'
import type { SafeTransaction } from '@weichain/safe-core-sdk-types'
import { OperationType } from '@weichain/safe-core-sdk-types'
import useAsync from '@/hooks/useAsync'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import useSafeAddress from './useSafeAddress'
import useWallet from './wallets/useWallet'
import { useSafeSDK } from './coreSDK/safeCoreSDK'
import useIsSafeOwner from './useIsSafeOwner'
import { Errors, logError } from '@/services/exceptions'

const getEncodedSafeTx = (safeSDK: Safe, safeTx: SafeTransaction, from?: string): string => {
  const EXEC_TX_METHOD = 'execTransaction'

  return safeSDK
    .getContractManager()
    .safeContract.encode(EXEC_TX_METHOD, [
      safeTx.data.to,
      safeTx.data.value,
      safeTx.data.data,
      safeTx.data.operation,
      safeTx.data.safeTxGas,
      0,
      safeTx.data.gasPrice,
      safeTx.data.gasToken,
      safeTx.data.refundReceiver,
      encodeSignatures(safeTx, from),
    ])
}

const useGasLimit = (
  safeTx?: SafeTransaction,
): {
  gasLimit?: BigNumber
  gasLimitError?: Error
  gasLimitLoading: boolean
} => {
  const safeSDK = useSafeSDK()
  const web3ReadOnly = useWeb3ReadOnly()
  const safeAddress = useSafeAddress()
  const wallet = useWallet()
  const walletAddress = wallet?.address
  const isOwner = useIsSafeOwner()

  const encodedSafeTx = useMemo<string>(() => {
    if (!safeTx || !safeSDK || !walletAddress) {
      return ''
    }
    return getEncodedSafeTx(safeSDK, safeTx, isOwner ? walletAddress : undefined)
  }, [safeSDK, safeTx, walletAddress, isOwner])

  const operationType = useMemo<number>(() => (safeTx?.data.operation == OperationType.DelegateCall ? 1 : 0), [
    safeTx?.data.operation,
  ])

  const [gasLimit, gasLimitError, gasLimitLoading] = useAsync<BigNumber>(() => {
    if (!safeAddress || !walletAddress || !encodedSafeTx || !web3ReadOnly) return

    return web3ReadOnly.estimateGas({
      to: safeAddress,
      from: walletAddress,
      data: encodedSafeTx,
      type: operationType,
    })
  }, [safeAddress, walletAddress, encodedSafeTx, web3ReadOnly, operationType])

  useEffect(() => {
    if (gasLimitError) {
      logError(Errors._612, gasLimitError.message)
    }
  }, [gasLimitError])

  return { gasLimit, gasLimitError, gasLimitLoading }
}

export default useGasLimit
