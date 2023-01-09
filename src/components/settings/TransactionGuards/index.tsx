import EthHashInfo from '@/components/common/EthHashInfo'
import useSafeInfo from '@/hooks/useSafeInfo'
import { Paper, Grid, Typography, Box } from '@mui/material'
import { gte } from 'semver'
import { RemoveGuard } from './RemoveGuard'
import useIsGranted from '@/hooks/useIsGranted'

import css from './styles.module.css'
import ExternalLink from '@/components/common/ExternalLink'

const NoTransactionGuard = () => {
  return (
    <Typography mt={2} color={({ palette }) => palette.primary.light}>
      No transaction guard set
    </Typography>
  )
}

const GuardDisplay = ({ guardAddress, chainId }: { guardAddress: string; chainId: string }) => {
  const isGranted = useIsGranted()

  return (
    <Box className={css.guardDisplay}>
      <EthHashInfo shortAddress={false} address={guardAddress} showCopyButton chainId={chainId} />
      {isGranted && <RemoveGuard address={guardAddress} />}
    </Box>
  )
}

const GUARD_SUPPORTED_SAFE_VERSION = '1.3.0'

const TransactionGuards = () => {
  const { safe, safeLoaded } = useSafeInfo()

  const isVersionWithGuards = safeLoaded && safe.version && gte(safe.version, GUARD_SUPPORTED_SAFE_VERSION)

  if (!isVersionWithGuards) {
    return null
  }

  return (
    <Paper sx={{ padding: 4 }}>
      <Grid container direction="row" justifyContent="space-between" spacing={3}>
        <Grid item lg={4} xs={12}>
          <Typography variant="h4" fontWeight={700}>
            Transaction guards
          </Typography>
        </Grid>

        <Grid item xs>
          <Box>
            <Typography>
              Transaction guards impose additional constraints that are checked prior to executing a Safe transaction.
              Transaction guards are potentially risky, so make sure to only use transaction guards from trusted
              sources. Learn more about transaction guards{' '}
              <ExternalLink href="https://help.safe.global/en/articles/5324092-what-is-a-transaction-guard">
                here
              </ExternalLink>
              .
            </Typography>
            {safe.guard ? (
              <GuardDisplay guardAddress={safe.guard.value} chainId={safe.chainId} />
            ) : (
              <NoTransactionGuard />
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default TransactionGuards
