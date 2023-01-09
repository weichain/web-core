import { Paper, Grid, Typography, Box } from '@mui/material'
import { NoSpendingLimits } from '@/components/settings/SpendingLimits/NoSpendingLimits'
import { SpendingLimitsTable } from '@/components/settings/SpendingLimits/SpendingLimitsTable'
import { useSelector } from 'react-redux'
import { selectSpendingLimits } from '@/store/spendingLimitsSlice'
import { NewSpendingLimit } from '@/components/settings/SpendingLimits/NewSpendingLimit'
import { useCurrentChain } from '@/hooks/useChains'
import { hasFeature } from '@/utils/chains'
import { FEATURES } from '@safe-global/safe-gateway-typescript-sdk'
import useIsGranted from '@/hooks/useIsGranted'

const SpendingLimits = () => {
  const isGranted = useIsGranted()
  const spendingLimits = useSelector(selectSpendingLimits)
  const currentChain = useCurrentChain()
  const isEnabled = currentChain && hasFeature(currentChain, FEATURES.SPENDING_LIMIT)

  return (
    <Paper sx={{ padding: 4 }}>
      <Grid container direction="row" justifyContent="space-between" spacing={3} mb={2}>
        <Grid item lg={4} xs={12}>
          <Typography variant="h4" fontWeight={700}>
            Spending limits
          </Typography>
        </Grid>

        <Grid item xs>
          {isEnabled ? (
            <Box>
              <Typography>
                You can set rules for specific beneficiaries to access funds from this Safe without having to collect
                all signatures.
              </Typography>

              {isGranted && <NewSpendingLimit />}
              {!spendingLimits.length && <NoSpendingLimits />}
            </Box>
          ) : (
            <Typography>The spending limit module is not yet available on this chain.</Typography>
          )}
        </Grid>
      </Grid>

      {spendingLimits.length > 0 && <SpendingLimitsTable spendingLimits={spendingLimits} />}
    </Paper>
  )
}

export default SpendingLimits
