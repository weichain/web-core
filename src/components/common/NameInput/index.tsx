import type { TextFieldProps } from '@mui/material'
import { TextField } from '@mui/material'
import get from 'lodash/get'
import type { FieldError, Validate } from 'react-hook-form'
import { useFormContext } from 'react-hook-form'

const NameInput = ({
  name,
  validate,
  required = false,
  ...props
}: Omit<TextFieldProps, 'error' | 'variant' | 'ref' | 'fullWidth'> & {
  name: string
  validate?: Validate<string>
  required?: boolean
}) => {
  const { register, formState } = useFormContext() || {}
  // the name can be a path: e.g. "owner.3.name"
  const fieldError = get(formState.errors, name) as FieldError | undefined

  return (
    <TextField
      {...props}
      variant="outlined"
      label={<>{fieldError?.type === 'maxLength' ? 'Maximum 50 symbols' : fieldError?.message || props.label}</>}
      error={Boolean(fieldError)}
      fullWidth
      required={required}
      {...register(name, { maxLength: 50, required })}
    />
  )
}

export default NameInput
