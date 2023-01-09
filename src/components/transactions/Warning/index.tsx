import type { ReactElement } from 'react'
import { Alert, SvgIcon, Tooltip } from '@mui/material'
import type { AlertColor } from '@mui/material'

import InfoOutlinedIcon from '@/public/images/notifications/info.svg'
import css from './styles.module.css'
import ExternalLink from '@/components/common/ExternalLink'

const Warning = ({
  title,
  text,
  severity,
}: {
  title: string | ReactElement
  text: string
  severity: AlertColor
}): ReactElement => {
  return (
    <Tooltip title={title} placement="top-start" arrow>
      <Alert
        className={css.alert}
        sx={{ borderLeft: ({ palette }) => `3px solid ${palette[severity].main} !important` }}
        severity={severity}
        icon={<SvgIcon component={InfoOutlinedIcon} inheritViewBox color={severity} />}
      >
        <b>{text}</b>
      </Alert>
    </Tooltip>
  )
}

const UNEXPECTED_DELEGATE_ARTICLE =
  'https://help.safe.global/en/articles/6302452-why-do-i-see-an-unexpected-delegate-call-warning-in-my-transaction'

export const DelegateCallWarning = ({ showWarning }: { showWarning: boolean }): ReactElement => {
  const severity = showWarning ? 'warning' : 'success'
  return (
    <Warning
      title={
        <>
          This transaction calls a smart contract that will be able to modify your Safe.
          {showWarning && (
            <>
              <br />
              <ExternalLink href={UNEXPECTED_DELEGATE_ARTICLE}>Learn more</ExternalLink>
            </>
          )}
        </>
      }
      severity={severity}
      text={showWarning ? 'Unexpected delegate call' : 'Delegate call'}
    />
  )
}

export const ThresholdWarning = (): ReactElement => (
  <Warning
    title="This transaction potentially alters the number of confirmations required to execute a transaction. Please verify before signing."
    severity="warning"
    text="Confirmation policy change"
  />
)

export const UnsignedWarning = (): ReactElement => (
  <Warning
    title="This transaction is unsigned and could have been created by anyone. To avoid phishing, only sign it if you trust the source of the link."
    severity="error"
    text="Untrusted transaction"
  />
)
