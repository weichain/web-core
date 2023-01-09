import type { Operation, TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'
import { proposeTransaction } from '@safe-global/safe-gateway-typescript-sdk'
import type { SafeTransaction } from '@weichain/safe-core-sdk-types'

const proposeTx = async (
  chainId: string,
  safeAddress: string,
  sender: string,
  tx: SafeTransaction,
  safeTxHash: string,
  origin?: string,
): Promise<TransactionDetails> => {
  const signatures = tx.signatures.size ? tx.encodedSignatures() : undefined

  return proposeTransaction(chainId, safeAddress, {
    ...tx.data,
    safeTxHash,
    sender,
    value: tx.data.value.toString(),
    // eslint-disable-next-line prettier/prettier
    operation: (tx.data.operation as unknown) as Operation,
    nonce: tx.data.nonce.toString(),
    safeTxGas: tx.data.safeTxGas.toString(),
    baseGas: tx.data.baseGas.toString(),
    gasPrice: tx.data.gasPrice.toString(),
    signature: signatures,
    origin,
  })
}

export default proposeTx
