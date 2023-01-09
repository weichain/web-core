import { Box, Button, Typography } from '@mui/material'
import { useState } from 'react'

import { LATEST_SAFE_VERSION } from '@/config/constants'

import TxModal from '@/components/tx/TxModal'

import useTxSender from '@/hooks/useTxSender'
import useAsync from '@/hooks/useAsync'

import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import type { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import type { SafeTransaction } from '@weichain/safe-core-sdk-types'
import { createUpdateSafeTxs } from '@/services/tx/safeUpdateParams'

import useSafeInfo from '@/hooks/useSafeInfo'
import { useCurrentChain } from '@/hooks/useChains'
import ExternalLink from '@/components/common/ExternalLink'

const UpdateSafeSteps: TxStepperProps['steps'] = [
  {
    label: 'Update Safe version',
    render: (_, onSubmit) => <ReviewUpdateSafeStep onSubmit={onSubmit} />,
  },
]

const UpdateSafeDialog = () => {
  const [open, setOpen] = useState(false)

  const handleClose = () => setOpen(false)

  return (
    <Box paddingTop={2}>
      <div>
        <Button onClick={() => setOpen(true)} variant="contained">
          Update Safe
        </Button>
      </div>
      {open && <TxModal onClose={handleClose} steps={UpdateSafeSteps} />}
    </Box>
  )
}

const ReviewUpdateSafeStep = ({ onSubmit }: { onSubmit: (txId?: string) => void }) => {
  const { safe, safeLoaded } = useSafeInfo()
  const chain = useCurrentChain()
  const { createMultiSendCallOnlyTx } = useTxSender()

  const [safeTx, safeTxError] = useAsync<SafeTransaction>(() => {
    if (!chain || !safeLoaded) return

    const txs = createUpdateSafeTxs(safe, chain)
    return createMultiSendCallOnlyTx(txs)
  }, [chain, safe, safeLoaded, createMultiSendCallOnlyTx])

  return (
    <SignOrExecuteForm safeTx={safeTx} onSubmit={onSubmit} error={safeTxError}>
      <Typography mb={2}>
        Update now to take advantage of new features and the highest security standards available.
      </Typography>

      <Typography mb={2}>
        To check details about updates added by this smart contract version please visit{' '}
        <ExternalLink href={`https://github.com/safe-global/safe-contracts/releases/tag/v${LATEST_SAFE_VERSION}`}>
          latest Safe contracts changelog
        </ExternalLink>
      </Typography>

      <Typography mb={2}>
        You will need to confirm this update just like any other transaction. This means other owners will have to
        confirm the update in case more than one confirmation is required for this Safe.
      </Typography>

      <Typography mb={2}>
        <b>Warning:</b> this upgrade will invalidate all unexecuted transactions. This means you will be unable to
        access or execute them after the upgrade. Please make sure to execute any remaining transactions before
        upgrading.
      </Typography>
    </SignOrExecuteForm>
  )
}

export default UpdateSafeDialog
