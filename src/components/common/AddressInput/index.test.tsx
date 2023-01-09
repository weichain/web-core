import { act, fireEvent, waitFor } from '@testing-library/react'
import { render } from '@/tests/test-utils'
import { useForm, FormProvider } from 'react-hook-form'
import AddressInput, { type AddressInputProps } from '.'
import { useCurrentChain } from '@/hooks/useChains'
import useNameResolver from '@/components/common/AddressInput/useNameResolver'

// mock useCurrentChain
jest.mock('@/hooks/useChains', () => ({
  useCurrentChain: jest.fn(() => ({
    shortName: 'gor',
    chainId: '5',
    chainName: 'Goerli',
    features: ['DOMAIN_LOOKUP'],
  })),
}))

// mock useNameResolver
jest.mock('@/components/common/AddressInput/useNameResolver', () => ({
  __esModule: true,
  default: jest.fn((val: string) => ({
    address: val === 'zero.eth' ? '0x0000000000000000000000000000000000000000' : undefined,
    resolverError: val === 'bogus.eth' ? new Error('Failed to resolve') : undefined,
    resolving: false,
  })),
}))

const TestForm = ({ address, validate }: { address: string; validate?: AddressInputProps['validate'] }) => {
  const name = 'recipient'

  const methods = useForm<{
    [name]: string
  }>({
    defaultValues: {
      [name]: address,
    },
    mode: 'onChange',
  })

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(() => null)}>
        <AddressInput name={name} label="Recipient address" validate={validate} />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  )
}

const setup = (address: string, validate?: AddressInputProps['validate']) => {
  const utils = render(<TestForm address={address} validate={validate} />)
  const input = utils.getByLabelText('Recipient address', { exact: false })

  return {
    input: input as HTMLInputElement,
    utils,
  }
}

const TEST_ADDRESS_A = '0x0000000000000000000000000000000000000000'
const TEST_ADDRESS_B = '0x0000000000000000000000000000000000000001'

describe('AddressInput tests', () => {
  beforeAll(() => {
    jest.useFakeTimers()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render with a default address value', () => {
    const { input } = setup(TEST_ADDRESS_A)
    expect(input.value).toBe(TEST_ADDRESS_A)
  })

  it('should render with a default prefixed address value', () => {
    const { input } = setup(`eth:${TEST_ADDRESS_A}`)
    expect(input.value).toBe(`eth:${TEST_ADDRESS_A}`)
  })

  it('should validate the address on input', async () => {
    const { input, utils } = setup('')

    act(() => {
      fireEvent.change(input, { target: { value: `xyz:${TEST_ADDRESS_A}` } })
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() => expect(utils.getByLabelText('Invalid chain prefix "xyz"', { exact: false })).toBeDefined())

    act(() => {
      fireEvent.change(input, { target: { value: `eth:${TEST_ADDRESS_A}` } })
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() =>
      expect(utils.getByLabelText(`"eth" doesn't match the current chain`, { exact: false })).toBeDefined(),
    )

    act(() => {
      fireEvent.change(input, { target: { value: 'gor:0x123' } })
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() => expect(utils.getByLabelText(`Invalid address format`, { exact: false })).toBeDefined())
  })

  it('should accept a custom validate function', async () => {
    const { input, utils } = setup('', (val) => `${val} is wrong`)

    act(() => {
      fireEvent.change(input, { target: { value: `gor:${TEST_ADDRESS_A}` } })
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() => expect(utils.getByLabelText(`${TEST_ADDRESS_A} is wrong`, { exact: false })).toBeDefined())

    act(() => {
      fireEvent.change(input, { target: { value: `gor:${TEST_ADDRESS_B}` } })
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() => expect(utils.getByLabelText(`${TEST_ADDRESS_B} is wrong`, { exact: false })).toBeDefined())
  })

  it('should resolve ENS names', async () => {
    const { input } = setup('')

    act(() => {
      fireEvent.change(input, { target: { value: 'zero.eth' } })
    })

    await waitFor(() => expect(input.value).toBe('0x0000000000000000000000000000000000000000'))

    expect(useNameResolver).toHaveBeenCalledWith('zero.eth')
  })

  it('should show an error if ENS resolution has failed', async () => {
    const { input, utils } = setup('')

    act(() => {
      fireEvent.change(input, { target: { value: 'bogus.eth' } })
      jest.advanceTimersByTime(1000)
    })

    expect(useNameResolver).toHaveBeenCalledWith('bogus.eth')
    await waitFor(() => expect(utils.getByLabelText(`Failed to resolve`, { exact: false })).toBeDefined())
  })

  it('should not resolve ENS names if this feature is disabled', async () => {
    ;(useCurrentChain as jest.Mock).mockImplementation(() => ({
      shortName: 'gor',
      chainId: '5',
      chainName: 'Goerli',
      features: [],
    }))

    const { input, utils } = setup('')

    act(() => {
      fireEvent.change(input, { target: { value: 'zero.eth' } })
      jest.advanceTimersByTime(1000)
    })

    expect(useNameResolver).toHaveBeenCalledWith('')
    await waitFor(() => expect(input.value).toBe('zero.eth'))
    await waitFor(() => expect(utils.getByLabelText('Invalid address format', { exact: false })).toBeDefined())
  })

  it('should show chain prefix in an adornment', async () => {
    const { input } = setup(TEST_ADDRESS_A)

    await waitFor(() => expect(input.value).toBe(TEST_ADDRESS_A))

    expect(input.previousElementSibling?.textContent).toBe('gor:')
  })

  it('should not show adornment when the value contains correct prefix', async () => {
    ;(useCurrentChain as jest.Mock).mockImplementation(() => ({
      shortName: 'gor',
      chainId: '5',
      chainName: 'Goerli',
      features: [],
    }))

    const { input } = setup(`gor:${TEST_ADDRESS_A}`)

    act(() => {
      fireEvent.change(input, { target: { value: `gor:${TEST_ADDRESS_B}` } })
    })

    await waitFor(() => expect(input.previousElementSibling).toBe(null))
  })

  it('should keep a bare address in the form state', async () => {
    let methods: any

    const Form = () => {
      const name = 'recipient'

      methods = useForm<{
        [name]: string
      }>({
        defaultValues: {
          [name]: '',
        },
      })

      return (
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(() => null)}>
            <AddressInput name={name} label="Recipient" />
          </form>
        </FormProvider>
      )
    }

    const utils = render(<Form />)
    const input = utils.getByLabelText('Recipient', { exact: false }) as HTMLInputElement

    act(() => {
      fireEvent.change(input, { target: { value: `gor:${TEST_ADDRESS_A}` } })
    })

    expect(methods.getValues().recipient).toBe(TEST_ADDRESS_A)
  })
})
