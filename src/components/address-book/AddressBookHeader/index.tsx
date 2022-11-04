import { Button, SvgIcon, Grid, IconButton } from '@mui/material'
import type { ReactElement, ElementType } from 'react'
import InputAdornment from '@mui/material/InputAdornment'
import SearchIcon from '@/public/images/common/search.svg'
import TextField from '@mui/material/TextField'

import Track from '@/components/common/Track'
import { ADDRESS_BOOK_EVENTS } from '@/services/analytics/events/addressBook'
import PageHeader from '@/components/common/PageHeader'
import { ModalType } from '../AddressBookTable'
import { useAppSelector } from '@/store'
import { selectAllAddressBooks } from '@/store/addressBookSlice'
import ImportIcon from '@/public/images/address-book/import.svg'
import ExportIcon from '@/public/images/address-book/export.svg'
import AddCircleIcon from '@/public/images/common/add-outlined.svg'

import css from './styles.module.css'

const HeaderButton = ({
  icon,
  onClick,
  disabled,
  children,
}: {
  icon: ElementType
  onClick: () => void
  disabled?: boolean
  children: string
}): ReactElement => {
  const svg = <SvgIcon component={icon} inheritViewBox />

  return (
    <>
      <IconButton color="primary" onClick={onClick} disabled={disabled} className={css.iconButton}>
        {svg}
      </IconButton>

      <Button
        onClick={onClick}
        disabled={disabled}
        variant="text"
        color="primary"
        size="small"
        startIcon={svg}
        className={css.button}
      >
        {children}
      </Button>
    </>
  )
}

type Props = {
  handleOpenModal: (type: ModalType) => () => void
  searchQuery: string
  onSearchQueryChange: (searchQuery: string) => void
}

const AddressBookHeader = ({ handleOpenModal, searchQuery, onSearchQueryChange }: Props): ReactElement => {
  const allAddressBooks = useAppSelector(selectAllAddressBooks)
  const canExport = Object.values(allAddressBooks).some((addressBook) => Object.keys(addressBook || {}).length > 0)

  return (
    <PageHeader
      title="Address book"
      noBorder
      action={
        <Grid container pb={1}>
          <Grid item xs={8} md={5} xl={4.5}>
            <TextField
              placeholder="Search"
              variant="filled"
              hiddenLabel
              value={searchQuery}
              onChange={(e) => {
                onSearchQueryChange(e.target.value)
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SvgIcon component={SearchIcon} inheritViewBox color="border" />
                  </InputAdornment>
                ),
                disableUnderline: true,
              }}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={4} md={7} display="flex" justifyContent="flex-end" alignItems="center">
            <Track {...ADDRESS_BOOK_EVENTS.IMPORT_BUTTON}>
              <HeaderButton onClick={handleOpenModal(ModalType.IMPORT)} icon={ImportIcon}>
                Import
              </HeaderButton>
            </Track>

            <Track {...ADDRESS_BOOK_EVENTS.DOWNLOAD_BUTTON}>
              <HeaderButton onClick={handleOpenModal(ModalType.EXPORT)} icon={ExportIcon} disabled={!canExport}>
                Export
              </HeaderButton>
            </Track>

            <Track {...ADDRESS_BOOK_EVENTS.CREATE_ENTRY}>
              <HeaderButton onClick={handleOpenModal(ModalType.ENTRY)} icon={AddCircleIcon}>
                Create entry
              </HeaderButton>
            </Track>
          </Grid>
        </Grid>
      }
    />
  )
}

export default AddressBookHeader
