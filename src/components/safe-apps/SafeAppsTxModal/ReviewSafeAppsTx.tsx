import { useMemo, useState } from 'react'
import type { ReactElement } from 'react'
import type { DecodedDataResponse } from '@safe-global/safe-gateway-typescript-sdk'
import { getDecodedData, Operation } from '@safe-global/safe-gateway-typescript-sdk'
import type { SafeTransaction } from '@weichain/safe-core-sdk-types'
import { OperationType } from '@weichain/safe-core-sdk-types'
import { Box, Typography } from '@mui/material'
import SendFromBlock from '@/components/tx/SendFromBlock'
import Multisend from '@/components/transactions/TxDetails/TxData/DecodedData/Multisend'
import SendToBlock from '@/components/tx/SendToBlock'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { generateDataRowValue } from '@/components/transactions/TxDetails/Summary/TxDataRow'
import useAsync from '@/hooks/useAsync'
import useChainId from '@/hooks/useChainId'
import { useCurrentChain } from '@/hooks/useChains'
import useTxSender from '@/hooks/useTxSender'
import { getInteractionTitle } from '../utils'
import type { SafeAppsTxParams } from '.'
import { isEmptyHexData } from '@/utils/hex'
import { trackSafeAppTxCount } from '@/services/safe-apps/track-app-usage-count'
import { getTxOrigin } from '@/utils/transactions'

type ReviewSafeAppsTxProps = {
  safeAppsTx: SafeAppsTxParams
}

const ReviewSafeAppsTx = ({
  safeAppsTx: { txs, requestId, params, appId, app },
}: ReviewSafeAppsTxProps): ReactElement => {
  const { createMultiSendCallOnlyTx, dispatchSafeAppsTx } = useTxSender()
  const chainId = useChainId()
  const chain = useCurrentChain()
  const [submitError, setSubmitError] = useState<Error>()

  const isMultiSend = txs.length > 1

  const [safeTx, safeTxError] = useAsync<SafeTransaction | undefined>(async () => {
    const tx = await createMultiSendCallOnlyTx(txs)

    if (params?.safeTxGas) {
      // FIXME: do it properly via the Core SDK
      // @ts-expect-error safeTxGas readonly
      tx.data.safeTxGas = params.safeTxGas
    }

    return tx
  }, [txs, createMultiSendCallOnlyTx])

  const [decodedData] = useAsync<DecodedDataResponse | undefined>(async () => {
    if (!safeTx || isEmptyHexData(safeTx.data.data)) return

    return getDecodedData(chainId, safeTx.data.data)
  }, [safeTx, chainId])

  const handleSubmit = async () => {
    setSubmitError(undefined)
    if (!safeTx) return
    trackSafeAppTxCount(Number(appId))

    try {
      await dispatchSafeAppsTx(safeTx, requestId)
    } catch (error) {
      setSubmitError(error as Error)
    }
  }

  const origin = useMemo(() => getTxOrigin(app), [app])

  return (
    <SignOrExecuteForm safeTx={safeTx} onSubmit={handleSubmit} error={safeTxError || submitError} origin={origin}>
      <>
        <SendFromBlock />

        {safeTx && (
          <>
            <SendToBlock address={safeTx.data.to} title={getInteractionTitle(safeTx.data.value || '', chain)} />

            <Box pb={2}>
              <Typography mt={2} color="primary.light">
                Data (hex encoded)
              </Typography>
              {generateDataRowValue(safeTx.data.data, 'rawData')}
            </Box>

            {isMultiSend && (
              <Box mb={2} display="flex" flexDirection="column" gap={1}>
                <Multisend
                  txData={{
                    dataDecoded: decodedData,
                    to: { value: safeTx.data.to },
                    value: safeTx.data.value,
                    operation: safeTx.data.operation === OperationType.Call ? Operation.CALL : Operation.DELEGATE,
                    trustedDelegateCallTarget: false,
                  }}
                  variant="outlined"
                />
              </Box>
            )}
          </>
        )}
      </>
    </SignOrExecuteForm>
  )
}

export default ReviewSafeAppsTx
