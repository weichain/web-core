import type { SyntheticEvent, ReactElement } from 'react'
import { Accordion, AccordionDetails, AccordionSummary, Box, Skeleton } from '@mui/material'
import { type SafeTransaction } from '@weichain/safe-core-sdk-types'
import {
  type DecodedDataResponse,
  getDecodedData,
  getTransactionDetails,
  type TransactionDetails,
} from '@gnosis.pm/safe-react-gateway-sdk'
import useChainId from '@/hooks/useChainId'
import useAsync from '@/hooks/useAsync'
import { MethodDetails } from '@/components/transactions/TxDetails/TxData/DecodedData/MethodDetails'
import ErrorMessage from '../ErrorMessage'
import Summary from '@/components/transactions/TxDetails/Summary'
import { trackEvent, MODALS_EVENTS } from '@/services/analytics'
import { isEmptyHexData } from '@/utils/hex'

type DecodedTxProps = {
  tx?: SafeTransaction
  txId?: string
}

const DecodedTx = ({ tx, txId }: DecodedTxProps): ReactElement | null => {
  const chainId = useChainId()
  const encodedData = tx?.data.data
  const isEmptyData = !!encodedData && isEmptyHexData(encodedData)

  const [decodedData, decodedDataError, decodedDataLoading] = useAsync<DecodedDataResponse>(() => {
    if (!encodedData || isEmptyData) return
    return getDecodedData(chainId, encodedData)
  }, [chainId, encodedData, isEmptyData])

  const [txDetails, txDetailsError, txDetailsLoading] = useAsync<TransactionDetails>(() => {
    if (!txId) return
    return getTransactionDetails(chainId, txId)
  }, [])

  if (isEmptyData && !txId) {
    return null
  }

  const onChangeExpand = (_: SyntheticEvent, expanded: boolean) => {
    trackEvent({ ...MODALS_EVENTS.TX_DETAILS, label: expanded ? 'Open' : 'Close' })
  }

  return (
    <Box mb={2}>
      <Accordion elevation={0} onChange={onChangeExpand} sx={!tx ? { pointerEvents: 'none' } : undefined}>
        <AccordionSummary>Transaction details</AccordionSummary>

        <AccordionDetails>
          {txDetails ? (
            <Box mb={1}>
              <Summary txDetails={txDetails} defaultExpanded />
            </Box>
          ) : txDetailsError ? (
            <ErrorMessage error={txDetailsError}>Failed loading transaction details</ErrorMessage>
          ) : (
            txDetailsLoading && <Skeleton />
          )}

          {decodedData ? (
            <MethodDetails data={decodedData} />
          ) : decodedDataError ? (
            <ErrorMessage error={decodedDataError}>Failed decoding transaction data</ErrorMessage>
          ) : (
            decodedDataLoading && <Skeleton />
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  )
}

export default DecodedTx
