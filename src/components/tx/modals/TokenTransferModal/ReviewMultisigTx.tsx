import { type ReactElement } from 'react'
import { Box, Typography } from '@mui/material'
import type { SafeTransaction } from '@weichain/safe-core-sdk-types'

import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { createTokenTransferParams } from '@/services/tx/tokenTransferParams'
import useBalances from '@/hooks/useBalances'
import useAsync from '@/hooks/useAsync'
import { createTx } from '@/services/tx/txSender'
import EthHashInfo from '@/components/common/EthHashInfo'
import SendFromBlock from '../../SendFromBlock'
import type { ReviewTokenTxProps } from '@/components/tx/modals/TokenTransferModal/ReviewTokenTx'
import { TokenTransferReview } from '@/components/tx/modals/TokenTransferModal/ReviewTokenTx'

const ReviewMultisigTx = ({ params, onSubmit }: ReviewTokenTxProps): ReactElement => {
  const { balances } = useBalances()

  const token = balances.items.find((item) => item.tokenInfo.address === params.tokenAddress)
  const { decimals, address } = token?.tokenInfo || {}

  // Create a safeTx
  const [safeTx, safeTxError] = useAsync<SafeTransaction>(() => {
    if (!address || !decimals) return
    const txParams = createTokenTransferParams(params.recipient, params.amount, decimals, address)
    return createTx(txParams)
  }, [params, decimals, address])

  return (
    <SignOrExecuteForm safeTx={safeTx} onSubmit={onSubmit} error={safeTxError}>
      {token && <TokenTransferReview amount={params.amount} tokenInfo={token.tokenInfo} />}

      <SendFromBlock />

      <Typography color={({ palette }) => palette.text.secondary} pb={1}>
        Recipient
      </Typography>

      <Box mb={3}>
        <EthHashInfo address={params.recipient} shortAddress={false} hasExplorer showCopyButton />
      </Box>
    </SignOrExecuteForm>
  )
}

export default ReviewMultisigTx
