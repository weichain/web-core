import { CircularProgress } from '@mui/material'
import ErrorMessage from '@/components/tx/ErrorMessage'
import { useRouter } from 'next/router'
import useSafeInfo from '@/hooks/useSafeInfo'
import useAsync from '@/hooks/useAsync'
import type { Label, Transaction, TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'
import { LabelValue } from '@safe-global/safe-gateway-typescript-sdk'
import { getTransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'
import { sameAddress } from '@/utils/addresses'
import type { ReactElement } from 'react'
import { makeTxFromDetails } from '@/utils/transactions'
import { TxListGrid } from '@/components/transactions/TxList'
import ExpandableTransactionItem from '@/components/transactions/TxListItem/ExpandableTransactionItem'
import GroupLabel from '../GroupLabel'
import { isMultisigDetailedExecutionInfo } from '@/utils/transaction-guards'

const SingleTxGrid = ({ txDetails }: { txDetails: TransactionDetails }): ReactElement => {
  const tx: Transaction = makeTxFromDetails(txDetails)

  // Show a label for the transaction if it's a queued transaction
  const { safe } = useSafeInfo()
  const nonce = isMultisigDetailedExecutionInfo(txDetails?.detailedExecutionInfo)
    ? txDetails?.detailedExecutionInfo.nonce
    : -1
  const label = nonce === safe.nonce ? LabelValue.Next : nonce > safe.nonce ? LabelValue.Queued : undefined

  return (
    <TxListGrid>
      {label ? <GroupLabel item={{ label } as Label} /> : null}

      <ExpandableTransactionItem item={tx} txDetails={txDetails} />
    </TxListGrid>
  )
}

const SingleTx = () => {
  const router = useRouter()
  const { id } = router.query
  const transactionId = Array.isArray(id) ? id[0] : id
  const { safe, safeAddress } = useSafeInfo()

  const [txDetails, txDetailsError] = useAsync<TransactionDetails>(
    () => {
      if (!transactionId || !safeAddress) return

      return getTransactionDetails(safe.chainId, transactionId).then((details) => {
        // If the transaction is not related to the current safe, throw an error
        if (!sameAddress(details.safeAddress, safeAddress)) {
          return Promise.reject(new Error('Transaction with this id was not found in this Safe'))
        }
        return details
      })
    },
    [transactionId, safe.chainId, safe.txQueuedTag, safe.txHistoryTag, safeAddress],
    false,
  )

  if (txDetailsError) {
    return <ErrorMessage error={txDetailsError}>Failed to load transaction</ErrorMessage>
  }

  if (txDetails) {
    return <SingleTxGrid txDetails={txDetails} />
  }

  return <CircularProgress />
}

export default SingleTx
