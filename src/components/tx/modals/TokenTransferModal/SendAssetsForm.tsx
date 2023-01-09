import type { ReactElement } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import {
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  DialogContent,
  Box,
  SvgIcon,
} from '@mui/material'
import { type TokenInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { BigNumber } from '@ethersproject/bignumber'

import TokenIcon from '@/components/common/TokenIcon'
import { formatVisualAmount, safeFormatUnits } from '@/utils/formatters'
import { validateDecimalLength, validateLimitedAmount } from '@/utils/validation'
import useBalances from '@/hooks/useBalances'
import AddressBookInput from '@/components/common/AddressBookInput'
import InputValueHelper from '@/components/common/InputValueHelper'
import SendFromBlock from '../../SendFromBlock'
import SpendingLimitRow from '@/components/tx/SpendingLimitRow'
import useSpendingLimit from '@/hooks/useSpendingLimit'
import SendToBlock from '@/components/tx/SendToBlock'
import useAddressBook from '@/hooks/useAddressBook'
import { getSafeTokenAddress } from '@/components/common/SafeTokenWidget'
import useChainId from '@/hooks/useChainId'
import { sameAddress } from '@/utils/addresses'
import InfoIcon from '@/public/images/notifications/info.svg'
import useIsSafeTokenPaused from '@/components/tx/modals/TokenTransferModal/useIsSafeTokenPaused'
import NumberField from '@/components/common/NumberField'

export const AutocompleteItem = (item: { tokenInfo: TokenInfo; balance: string }): ReactElement => (
  <Grid container alignItems="center" gap={1}>
    <TokenIcon logoUri={item.tokenInfo.logoUri} tokenSymbol={item.tokenInfo.symbol} />

    <Grid item xs>
      <Typography variant="body2">{item.tokenInfo.name}</Typography>

      <Typography variant="caption" component="p">
        {formatVisualAmount(item.balance, item.tokenInfo.decimals)} {item.tokenInfo.symbol}
      </Typography>
    </Grid>
  </Grid>
)

export enum SendTxType {
  multiSig = 'multiSig',
  spendingLimit = 'spendingLimit',
}

export enum SendAssetsField {
  recipient = 'recipient',
  tokenAddress = 'tokenAddress',
  amount = 'amount',
  type = 'type',
}

export type SendAssetsFormData = {
  [SendAssetsField.recipient]: string
  [SendAssetsField.tokenAddress]: string
  [SendAssetsField.amount]: string
  [SendAssetsField.type]: SendTxType
}

type SendAssetsFormProps = {
  formData?: SendAssetsFormData
  disableSpendingLimit?: boolean
  onSubmit: (formData: SendAssetsFormData) => void
}

const SendAssetsForm = ({ onSubmit, formData, disableSpendingLimit = false }: SendAssetsFormProps): ReactElement => {
  const { balances } = useBalances()
  const addressBook = useAddressBook()
  const chainId = useChainId()
  const safeTokenAddress = getSafeTokenAddress(chainId)
  const isSafeTokenPaused = useIsSafeTokenPaused()

  const formMethods = useForm<SendAssetsFormData>({
    defaultValues: {
      [SendAssetsField.recipient]: formData?.[SendAssetsField.recipient] || '',
      [SendAssetsField.tokenAddress]: formData?.[SendAssetsField.tokenAddress] || '',
      [SendAssetsField.amount]: formData?.[SendAssetsField.amount] || '',
      [SendAssetsField.type]: disableSpendingLimit
        ? SendTxType.multiSig
        : formData?.[SendAssetsField.type] || SendTxType.multiSig,
    },
    mode: 'onChange',
    delayError: 500,
  })
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = formMethods

  const recipient = watch(SendAssetsField.recipient)

  // Selected token
  const tokenAddress = watch(SendAssetsField.tokenAddress)
  const selectedToken = tokenAddress
    ? balances.items.find((item) => item.tokenInfo.address === tokenAddress)
    : undefined

  const type = watch(SendAssetsField.type)
  const spendingLimit = useSpendingLimit(selectedToken?.tokenInfo)
  const isSpendingLimitType = type === SendTxType.spendingLimit

  const isSafeTokenSelected = sameAddress(safeTokenAddress, tokenAddress)

  const spendingLimitAmount = spendingLimit ? BigNumber.from(spendingLimit.amount).sub(spendingLimit.spent) : undefined

  const onMaxAmountClick = () => {
    if (!selectedToken) return

    const amount =
      isSpendingLimitType && spendingLimitAmount && spendingLimitAmount.lte(selectedToken.balance)
        ? spendingLimitAmount.toString()
        : selectedToken.balance

    setValue(SendAssetsField.amount, safeFormatUnits(amount, selectedToken.tokenInfo.decimals), {
      shouldValidate: true,
    })
  }

  const isDisabled = isSafeTokenSelected && isSafeTokenPaused

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <SendFromBlock />

          <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
            {addressBook[recipient] ? (
              <Box onClick={() => setValue(SendAssetsField.recipient, '')}>
                <SendToBlock address={recipient} />
              </Box>
            ) : (
              <AddressBookInput name={SendAssetsField.recipient} label="Recipient" />
            )}
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="asset-label" required>
              Select an asset
            </InputLabel>
            <Select
              labelId="asset-label"
              label={errors.tokenAddress?.message || 'Select an asset'}
              defaultValue={formData?.tokenAddress || ''}
              error={!!errors.tokenAddress}
              {...register(SendAssetsField.tokenAddress, {
                required: true,
                onChange: () => setValue(SendAssetsField.amount, ''),
              })}
            >
              {balances.items.map((item) => (
                <MenuItem key={item.tokenInfo.address} value={item.tokenInfo.address}>
                  <AutocompleteItem {...item} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {isDisabled && (
            <Box mt={1} display="flex" alignItems="center">
              <SvgIcon component={InfoIcon} color="error" fontSize="small" />
              <Typography variant="body2" color="error" ml={0.5}>
                $SAFE is currently non-transferable.
              </Typography>
            </Box>
          )}

          {!disableSpendingLimit && !!spendingLimitAmount && (
            <FormControl fullWidth sx={{ mt: 2 }}>
              <SpendingLimitRow availableAmount={spendingLimitAmount} selectedToken={selectedToken?.tokenInfo} />
            </FormControl>
          )}

          <FormControl fullWidth sx={{ mt: 2 }}>
            <NumberField
              label={errors.amount?.message || 'Amount'}
              error={!!errors.amount}
              InputProps={{
                endAdornment: (
                  <InputValueHelper onClick={onMaxAmountClick} disabled={!selectedToken}>
                    Max
                  </InputValueHelper>
                ),
              }}
              // @see https://github.com/react-hook-form/react-hook-form/issues/220
              InputLabelProps={{
                shrink: !!watch(SendAssetsField.amount),
              }}
              required
              {...register(SendAssetsField.amount, {
                required: true,
                validate: (val) => {
                  const decimals = selectedToken?.tokenInfo.decimals
                  const max = isSpendingLimitType ? spendingLimitAmount?.toString() : selectedToken?.balance
                  return validateLimitedAmount(val, decimals, max) || validateDecimalLength(val, decimals)
                },
              })}
            />
          </FormControl>
        </DialogContent>

        <Button variant="contained" type="submit" disabled={isDisabled}>
          Next
        </Button>
      </form>
    </FormProvider>
  )
}

export default SendAssetsForm
