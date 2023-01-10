import { useEffect, useRef, type ReactElement } from 'react'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import Link from 'next/link'
import classnames from 'classnames'

import css from './styles.module.css'
import SafeIcon from '@/components/common/SafeIcon'
import { useAppSelector } from '@/store'
import useSafeAddress from '@/hooks/useSafeAddress'
import { selectChainById } from '@/store/chainsSlice'
import SafeListItemSecondaryAction from '@/components/sidebar/SafeListItemSecondaryAction'
import useChainId from '@/hooks/useChainId'
import { AppRoutes } from '@/config/routes'
import SafeListContextMenu from '@/components/sidebar/SafeListContextMenu'
import Box from '@mui/material/Box'
import { selectAllAddressBooks } from '@/store/addressBookSlice'
import EthHashInfo from '@/components/common/EthHashInfo'
import { sameAddress } from '@/utils/addresses'

const SafeListItem = ({
  address,
  chainId,
  closeDrawer,
  shouldScrollToSafe,
  noActions = false,
  ...rest
}: {
  address: string
  chainId: string
  shouldScrollToSafe: boolean
  closeDrawer?: () => void
  threshold?: string | number
  owners?: string | number
  noActions?: boolean
}): ReactElement => {
  const safeRef = useRef<HTMLDivElement>(null)
  const safeAddress = useSafeAddress()
  const chain = useAppSelector((state) => selectChainById(state, chainId))
  const allAddressBooks = useAppSelector(selectAllAddressBooks)
  const currChainId = useChainId()
  const isCurrentSafe = chainId === currChainId && sameAddress(safeAddress, address)
  const name = allAddressBooks[chainId]?.[address]
  const shortName = chain?.shortName || ''

  // Scroll to the current Safe
  useEffect(() => {
    if (isCurrentSafe && shouldScrollToSafe) {
      safeRef.current?.scrollIntoView({ block: 'center' })
    }
  }, [isCurrentSafe, shouldScrollToSafe])

  return (
    <ListItem
      className={css.container}
      disablePadding
      sx={{ '& .MuiListItemSecondaryAction-root': { right: 24 } }}
      secondaryAction={
        noActions ? undefined : (
          <Box display="flex" alignItems="center" gap={1}>
            <SafeListItemSecondaryAction
              chainId={chainId}
              address={address}
              onClick={closeDrawer}
              href={{
                pathname: AppRoutes.newSafe.load,
                query: { chain: shortName, address },
              }}
            />
            <SafeListContextMenu name={name} address={address} chainId={chainId} />
          </Box>
        )
      }
    >
      <Link href={{ pathname: AppRoutes.home, query: { safe: `${shortName}:${address}` } }} passHref>
        <ListItemButton
          key={address}
          onClick={closeDrawer}
          selected={isCurrentSafe}
          className={classnames(css.safe, { [css.open]: isCurrentSafe })}
          ref={safeRef}
        >
          <ListItemIcon>
            <SafeIcon address={address} {...rest} />
          </ListItemIcon>
          <ListItemText
            sx={noActions ? undefined : { pr: 10 }}
            primaryTypographyProps={{
              variant: 'body2',
              component: 'div',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
            secondaryTypographyProps={{ component: 'div', color: 'primary' }}
            primary={name || ''}
            secondary={<EthHashInfo address={address} showAvatar={false} showName={false} prefix={shortName} />}
          />
        </ListItemButton>
      </Link>
    </ListItem>
  )
}

export default SafeListItem
