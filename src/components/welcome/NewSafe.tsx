import React, { useEffect, useState } from 'react'
import {
  Button,
  Grid,
  Paper,
  SvgIcon,
  Typography,
  AccordionSummary,
  AccordionDetails,
  Accordion,
  useMediaQuery,
} from '@mui/material'
import { useRouter } from 'next/router'
import { CREATE_SAFE_EVENTS, LOAD_SAFE_EVENTS } from '@/services/analytics/events/createLoadSafe'
import Track from '../common/Track'
import { AppRoutes } from '@/config/routes'
import SafeList from '@/components/sidebar/SafeList'
import css from './styles.module.css'
import NewSafeIcon from '@/public/images/welcome/new-safe.svg'
import LoadSafeIcon from '@/public/images/welcome/load-safe.svg'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useTheme } from '@mui/material/styles'

const NewSafe = () => {
  const [expanded, setExpanded] = useState(true)
  const router = useRouter()
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'))

  useEffect(() => {
    setExpanded(!isSmallScreen)
  }, [isSmallScreen])

  const toggleSafeList = () => {
    return isSmallScreen ? setExpanded((prev) => !prev) : null
  }

  return (
    <Grid container spacing={3} p={3} pb={0} flex={1}>
      <Grid item xs={12} md={4} lg={3.5} minWidth={{ md: 400 }} className={css.sidebar}>
        <Accordion className={css.accordion} onClick={toggleSafeList} expanded={expanded} defaultExpanded={true}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h4" display="inline" fontWeight={700}>
              My Safes
            </Typography>
          </AccordionSummary>

          <AccordionDetails sx={{ padding: 0 }} onClick={(event) => event.stopPropagation()}>
            <SafeList />
          </AccordionDetails>
        </Accordion>
      </Grid>

      <Grid item flex={1}>
        <div className={css.content}>
          <Typography
            variant="h1"
            fontSize={[44, null, 52]}
            lineHeight={1}
            letterSpacing={-1.5}
            color="static.main"
            mb={1}
          >
            Welcome to the Safe
          </Typography>

          <Typography mb={5} color="static.main">
            The most trusted decentralized custody protocol and collective asset management platform.
          </Typography>

          <Grid container spacing={3} sx={{ maxWidth: '800px' }}>
            <Grid item xs={12} lg={6}>
              <Paper sx={{ padding: 4, height: 1 }}>
                <SvgIcon component={NewSafeIcon} inheritViewBox sx={{ width: '42px', height: '42px' }} />
                <Typography variant="h3" fontWeight={700} mb={1} mt={3}>
                  Create Safe
                </Typography>

                <Typography variant="body2" mb={3}>
                  A new Safe that is controlled by one or multiple owners.
                </Typography>

                <Track {...CREATE_SAFE_EVENTS.CREATE_BUTTON}>
                  <Button variant="contained" onClick={() => router.push(AppRoutes.newSafe.create)}>
                    + Create new Safe
                  </Button>
                </Track>
              </Paper>
            </Grid>

            <Grid item xs={12} lg={6}>
              <Paper sx={{ padding: 4, height: 1 }}>
                <SvgIcon component={LoadSafeIcon} inheritViewBox sx={{ width: '42px', height: '42px' }} />
                <Typography variant="h3" fontWeight={700} mb={1} mt={3}>
                  Add existing Safe
                </Typography>

                <Typography variant="body2" mb={3}>
                  Already have a Safe? Add your Safe using your Safe address.
                </Typography>

                <Track {...LOAD_SAFE_EVENTS.LOAD_BUTTON}>
                  <Button variant="outlined" onClick={() => router.push(AppRoutes.newSafe.load)}>
                    Add existing Safe
                  </Button>
                </Track>
              </Paper>
            </Grid>
          </Grid>
        </div>
      </Grid>
    </Grid>
  )
}

export default NewSafe
