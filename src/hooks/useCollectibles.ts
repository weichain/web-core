import { useEffect } from 'react'
import { getCollectiblesPage, type SafeCollectiblesPage } from '@safe-global/safe-gateway-typescript-sdk'
import useAsync, { type AsyncResult } from './useAsync'
import { Errors, logError } from '@/services/exceptions'
import useSafeInfo from './useSafeInfo'

export const useCollectibles = (pageUrl?: string): AsyncResult<SafeCollectiblesPage> => {
  const { safe, safeAddress } = useSafeInfo()

  const [data, error, loading] = useAsync<SafeCollectiblesPage>(() => {
    if (!safeAddress) return
    return getCollectiblesPage(safe.chainId, safeAddress, undefined, pageUrl)
  }, [safeAddress, safe.chainId, pageUrl])

  // Log errors
  useEffect(() => {
    if (error) {
      logError(Errors._604, error.message)
    }
  }, [error])

  return [data, error, loading || !data]
}

export default useCollectibles
