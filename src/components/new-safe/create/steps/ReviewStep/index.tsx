import { useMemo } from 'react'
import { Button, Grid, Typography, Divider, Box } from '@mui/material'
import ChainIndicator from '@/components/common/ChainIndicator'
import EthHashInfo from '@/components/common/EthHashInfo'
import { useCurrentChain } from '@/hooks/useChains'
import useGasPrice from '@/hooks/useGasPrice'
import { useEstimateSafeCreationGas } from '@/components/new-safe/create/useEstimateSafeCreationGas'
import { formatVisualAmount } from '@/utils/formatters'
import type { StepRenderProps } from '@/components/new-safe/CardStepper/useCardStepper'
import type { NewSafeFormData } from '@/components/new-safe/create'
import css from '@/components/new-safe/create/steps/ReviewStep/styles.module.css'
import layoutCss from '@/components/new-safe/create/styles.module.css'
import { getFallbackHandlerContractInstance } from '@/services/contracts/safeContracts'
import { computeNewSafeAddress } from '@/components/new-safe/create/logic'
import useWallet from '@/hooks/wallets/useWallet'
import { useWeb3 } from '@/hooks/wallets/web3'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import { type PendingSafeData, SAFE_PENDING_CREATION_STORAGE_KEY } from '@/components/new-safe/create/steps/StatusStep'
import useSyncSafeCreationStep from '@/components/new-safe/create/useSyncSafeCreationStep'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import NetworkWarning from '@/components/new-safe/create/NetworkWarning'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import palette from '@/styles/colors'
import ReviewRow from '@/components/new-safe/ReviewRow'

const ReviewStep = ({ data, onSubmit, onBack, setStep }: StepRenderProps<NewSafeFormData>) => {
  const isWrongChain = useIsWrongChain()
  useSyncSafeCreationStep(setStep)
  const chain = useCurrentChain()
  const wallet = useWallet()
  const provider = useWeb3()
  const { maxFeePerGas, maxPriorityFeePerGas } = useGasPrice()
  const saltNonce = useMemo(() => Date.now(), [])
  const [_, setPendingSafe] = useLocalStorage<PendingSafeData | undefined>(SAFE_PENDING_CREATION_STORAGE_KEY)

  const safeParams = useMemo(() => {
    return {
      owners: data.owners.map((owner) => owner.address),
      threshold: data.threshold,
      saltNonce,
    }
  }, [data.owners, data.threshold, saltNonce])

  const { gasLimit } = useEstimateSafeCreationGas(safeParams)

  const totalFee =
    gasLimit && maxFeePerGas && maxPriorityFeePerGas
      ? formatVisualAmount(maxFeePerGas.add(maxPriorityFeePerGas).mul(gasLimit), chain?.nativeCurrency.decimals)
      : '> 0.001'

  const handleBack = () => {
    onBack(data)
  }

  const createSafe = async () => {
    if (!wallet || !provider || !chain) return

    const fallbackHandler = getFallbackHandlerContractInstance(chain.chainId)

    const props = {
      safeAccountConfig: {
        threshold: data.threshold,
        owners: data.owners.map((owner) => owner.address),
        fallbackHandler: fallbackHandler.getAddress(),
      },
      safeDeploymentConfig: {
        saltNonce: saltNonce.toString(),
      },
    }

    const safeAddress = await computeNewSafeAddress(provider, props)

    setPendingSafe({ ...data, saltNonce, safeAddress })
    onSubmit({ ...data, saltNonce, safeAddress })
  }

  return (
    <>
      <Box className={layoutCss.row}>
        <Grid container spacing={3}>
          <ReviewRow name="Network" value={<ChainIndicator chainId={chain?.chainId} inline />} />
          <ReviewRow name="Name" value={<Typography>{data.name}</Typography>} />
          <ReviewRow
            name="Owners"
            value={
              <Box className={css.ownersArray}>
                {data.owners.map((owner, index) => (
                  <EthHashInfo
                    address={owner.address}
                    name={owner.name || owner.ens}
                    shortAddress={false}
                    showPrefix={false}
                    showName
                    hasExplorer
                    showCopyButton
                    key={index}
                  />
                ))}
              </Box>
            }
          />
          <ReviewRow
            name="Threshold"
            value={
              <Typography>
                {data.threshold} out of {data.owners.length} owner(s)
              </Typography>
            }
          />
        </Grid>
      </Box>

      <Divider />
      <Box className={layoutCss.row}>
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <ReviewRow
              name="Est. network fee"
              value={
                <>
                  <Box
                    p={1}
                    sx={{
                      backgroundColor: palette.secondary.background,
                      color: 'static.main',
                      width: 'fit-content',
                      borderRadius: '6px',
                    }}
                  >
                    <Typography variant="body1">
                      <b>
                        &asymp; {totalFee} {chain?.nativeCurrency.symbol}
                      </b>
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    You will have to confirm a transaction with your connected wallet.
                  </Typography>
                </>
              }
            />
          </Grid>
        </Grid>

        {isWrongChain && <NetworkWarning />}
      </Box>
      <Divider />
      <Box className={layoutCss.row}>
        <Box display="flex" flexDirection="row" justifyContent="space-between" gap={3}>
          <Button variant="outlined" size="small" onClick={handleBack} startIcon={<ArrowBackIcon fontSize="small" />}>
            Back
          </Button>
          <Button onClick={createSafe} variant="contained" size="stretched" disabled={isWrongChain}>
            Next
          </Button>
        </Box>
      </Box>
    </>
  )
}

export default ReviewStep
