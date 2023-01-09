import type { Palette } from '@mui/material'
import { Box, CircularProgress, SvgIcon, Typography } from '@mui/material'
import type { ReactElement } from 'react'
import { type Transaction, TransactionStatus } from '@safe-global/safe-gateway-typescript-sdk'

import DateTime from '@/components/common/DateTime'
import TxInfo from '@/components/transactions/TxInfo'
import SignTxButton from '@/components/transactions/SignTxButton'
import ExecuteTxButton from '@/components/transactions/ExecuteTxButton'
import css from './styles.module.css'
import useWallet from '@/hooks/wallets/useWallet'
import { isAwaitingExecution, isMultisigExecutionInfo, isTxQueued } from '@/utils/transaction-guards'
import RejectTxButton from '@/components/transactions/RejectTxButton'
import useTransactionStatus from '@/hooks/useTransactionStatus'
import TxType from '@/components/transactions/TxType'
import OwnersIcon from '@/public/images/common/owners.svg'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import useIsPending from '@/hooks/useIsPending'

const getStatusColor = (value: TransactionStatus, palette: Palette) => {
  switch (value) {
    case TransactionStatus.SUCCESS:
      return palette.success.main
    case TransactionStatus.FAILED:
    case TransactionStatus.CANCELLED:
      return palette.error.main
    case TransactionStatus.AWAITING_CONFIRMATIONS:
    case TransactionStatus.AWAITING_EXECUTION:
      return palette.warning.main
    default:
      return palette.primary.main
  }
}

type TxSummaryProps = {
  isGrouped?: boolean
  item: Transaction
}

const TxSummary = ({ item, isGrouped }: TxSummaryProps): ReactElement => {
  const tx = item.transaction
  const wallet = useWallet()
  const isWrongChain = useIsWrongChain()
  const txStatusLabel = useTransactionStatus(tx)
  const isPending = useIsPending(tx.id)
  const isQueue = isTxQueued(tx.txStatus)
  const awaitingExecution = isAwaitingExecution(tx.txStatus)
  const nonce = isMultisigExecutionInfo(tx.executionInfo) ? tx.executionInfo.nonce : undefined
  const requiredConfirmations = isMultisigExecutionInfo(tx.executionInfo)
    ? tx.executionInfo.confirmationsRequired
    : undefined
  const submittedConfirmations = isMultisigExecutionInfo(tx.executionInfo)
    ? tx.executionInfo.confirmationsSubmitted
    : undefined

  const displayConfirmations = isQueue && !!submittedConfirmations && !!requiredConfirmations
  const confirmationColor =
    displayConfirmations && requiredConfirmations > submittedConfirmations ? 'border' : 'primary'

  return (
    <Box
      className={`${css.gridContainer} ${
        isQueue
          ? nonce && !isGrouped
            ? css.columnTemplate
            : css.columnTemplateWithoutNonce
          : css.columnTemplateTxHistory
      }`}
      id={tx.id}
    >
      {nonce && !isGrouped && <Box gridArea="nonce">{nonce}</Box>}

      <Box gridArea="type" className={css.columnWrap}>
        <TxType tx={tx} />
      </Box>

      <Box gridArea="info" className={css.columnWrap}>
        <TxInfo info={tx.txInfo} />
      </Box>

      <Box gridArea="date">
        <DateTime value={tx.timestamp} />
      </Box>

      {displayConfirmations && (
        <Box gridArea="confirmations" display="flex" alignItems="center" gap={1}>
          <SvgIcon component={OwnersIcon} inheritViewBox fontSize="small" color={confirmationColor} />
          <Typography variant="caption" fontWeight="bold" color={confirmationColor}>
            {submittedConfirmations} out of {requiredConfirmations}
          </Typography>
        </Box>
      )}

      {wallet && !isWrongChain && isQueue && (
        <Box gridArea="actions" display="flex" justifyContent={{ sm: 'center' }} gap={1}>
          {awaitingExecution ? (
            <ExecuteTxButton txSummary={item.transaction} compact />
          ) : (
            <SignTxButton txSummary={item.transaction} compact />
          )}
          <RejectTxButton txSummary={item.transaction} compact />
        </Box>
      )}

      <Box
        gridArea="status"
        marginLeft={{ sm: 'auto' }}
        marginRight={1}
        display="flex"
        alignItems="center"
        gap={1}
        color={({ palette }) => getStatusColor(tx.txStatus, palette)}
      >
        {isPending && <CircularProgress size={14} color="inherit" />}

        <Typography variant="caption" fontWeight="bold" color={({ palette }) => getStatusColor(tx.txStatus, palette)}>
          {txStatusLabel}
        </Typography>
      </Box>
    </Box>
  )
}

export default TxSummary
