import type { NextPage } from 'next'
import Head from 'next/head'
import { Grid, Paper, SvgIcon, Tooltip, Typography } from '@mui/material'
import InfoIcon from '@/public/images/notifications/info.svg'
import { ContractVersion } from '@/components/settings/ContractVersion'
import { OwnerList } from '@/components/settings/owner/OwnerList'
import { RequiredConfirmation } from '@/components/settings/RequiredConfirmations'
import useSafeInfo from '@/hooks/useSafeInfo'
import SettingsHeader from '@/components/settings/SettingsHeader'
import useIsGranted from '@/hooks/useIsGranted'

const Setup: NextPage = () => {
  const { safe } = useSafeInfo()
  const nonce = safe.nonce
  const ownerLength = safe.owners.length
  const threshold = safe.threshold
  const isGranted = useIsGranted()

  return (
    <>
      <Head>
        <title>Safe – Settings – Setup</title>
      </Head>

      <SettingsHeader />

      <main>
        <Paper sx={{ p: 4, mb: 2 }}>
          <Grid container spacing={3}>
            <Grid item lg={4} xs={12}>
              <Typography variant="h4" fontWeight={700}>
                Safe nonce
                <Tooltip
                  placement="top"
                  title="For security reasons, transactions made with Safe need to be executed in order. The nonce shows you which transaction will be executed next. You can find the nonce for a transaction in the transaction details."
                >
                  <span>
                    <SvgIcon
                      component={InfoIcon}
                      inheritViewBox
                      fontSize="small"
                      color="border"
                      sx={{ verticalAlign: 'middle', ml: 0.5 }}
                    />
                  </span>
                </Tooltip>
              </Typography>

              <Typography pt={1}>
                Current nonce: <b>{nonce}</b>
              </Typography>
            </Grid>

            <Grid item xs>
              <ContractVersion isGranted={isGranted} />
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 4 }}>
          <OwnerList isGranted={isGranted} />
          <RequiredConfirmation threshold={threshold} owners={ownerLength} isGranted={isGranted} />
        </Paper>
      </main>
    </>
  )
}

export default Setup
