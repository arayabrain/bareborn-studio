import { Box, Stack, styled, Typography } from '@mui/material'
import { ChangeEvent, FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'

const Signup = () => {
  const regex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(.\w{2,3})+$/
  const regexPassword = /^(?=.*\d)(?=.*[@$!%*#?&])(?=.*[a-zA-Z]).{6,100}$/

  const [errors, setErrors] = useState<{ [key: string]: string }>({
    email: '',
    password: '',
    reEnter: '',
  })
  const [values, setValues] = useState<{ [key: string]: string }>({
    email: '',
    password: '',
    reEnter: '',
  })

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    //todo call api.
  }

  const onChangeValue = (
    event: ChangeEvent<HTMLInputElement>,
    validate?: Function,
  ) => {
    const { name, value } = event.target
    setValues({ ...values, [name]: value })
    setErrors({ ...errors, [name]: validate?.(value) })
  }

  const validateEmail = (value: string): string => {
    if (!value) return 'This field is required'
    if (!regex.test(value)) {
      return 'Invalid email format'
    }
    return ''
  }

  const validatePassword = (value: string): string => {
    if (!value) return 'This field is required'
    if (!regexPassword.test(value)) {
      return 'Your password must be at least 6 characters long and must contain at least one letter, number, and special character'
    }
    return ''
  }

  const validateReEnter = (value: string): string => {
    if (!value) return 'This field is required'
    if (value !== values.password) {
      return 'Passwords do not match'
    }
    return ''
  }

  const validateReEnterWhenInputPassword = () => {
    const { reEnter, password } = values
    if (reEnter && reEnter !== password) {
      setErrors((pre) => ({ ...pre, reEnter: 'Passwords do not match' }))
    }
  }

  return (
    <LoginWrapper>
      <LoginContent>
        <Title>Create new your account</Title>
        <FormSignUp autoComplete="off" onSubmit={onSubmit}>
          <Box sx={{ position: 'relative' }}>
            <LabelField>
              Email<LableRequired>*</LableRequired>
            </LabelField>
            <Input
              autoComplete="off"
              error={!!errors.email}
              name="email"
              onChange={(e) => onChangeValue(e, validateEmail)}
              value={values.email}
              placeholder="Enter your email"
            />
            <TextError>{errors.email}</TextError>
          </Box>
          <Box sx={{ position: 'relative' }}>
            <LabelField>
              Password<LableRequired>*</LableRequired>
            </LabelField>
            <Input
              autoComplete="off"
              error={!!errors.password}
              onChange={(e) => onChangeValue(e, validatePassword)}
              name="password"
              type="password"
              value={values.password}
              placeholder="Enter your password"
              onBlur={validateReEnterWhenInputPassword}
            />
            <TextError>{errors.password}</TextError>
          </Box>
          <Box sx={{ position: 'relative' }}>
            <LabelField>
              Re-enter password<LableRequired>*</LableRequired>
            </LabelField>
            <Input
              error={!!errors.reEnter}
              onChange={(e) => onChangeValue(e, validateReEnter)}
              name="reEnter"
              type="password"
              value={values.reEnter}
              placeholder="Re-enter password"
            />
            <TextError>{errors.reEnter}</TextError>
          </Box>
          <Stack
            flexDirection="row"
            gap={2}
            alignItems="center"
            justifyContent="space-between"
          >
            <Description sx={{ mt: 0 }}>
              <LinkWrappper to="/login">Login</LinkWrappper>
            </Description>
            <ButtonLogin type="submit">Sign up</ButtonLogin>
          </Stack>
        </FormSignUp>
      </LoginContent>
    </LoginWrapper>
  )
}

const LoginWrapper = styled(Box)({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

const LoginContent = styled(Box)({
  padding: 30,
  boxShadow: '0 0 1px 1px rgba(0,0,0,0.1)',
  borderRadius: 4,
})

const Title = styled(Typography)({
  fontSize: 15,
  fontWeight: 600,
  marginBottom: 24,
})

const FormSignUp = styled('form')({
  maxWidth: 273,
})

const LabelField = styled(Typography)({
  fontSize: 14,
})

const LableRequired = styled('span')({
  color: 'red',
  fontSize: 18,
  marginLeft: 2,
})

const Input = styled('input', {
  shouldForwardProp: (props) => props !== 'error',
})<{ error: boolean }>(({ error }) => {
  return {
    width: 250,
    height: 24,
    borderRadius: 4,
    border: '1px solid',
    borderColor: error ? 'red' : '#d9d9d9',
    padding: '5px 10px',
    marginBottom: 15,
    transition: 'all 0.3s',
    outline: 'none',
    ':focus, :hover': {
      borderColor: '#1677ff',
    },
  }
})

const Description = styled(Typography)(({ theme }) => ({
  fontSize: 12,
  color: 'rgba(0, 0, 0, 0.65)',
  marginTop: theme.spacing(1),
}))

const LinkWrappper = styled(Link)({
  marginLeft: 10,
  color: '#1677ff',
})

const ButtonLogin = styled('button')({
  backgroundColor: '#283237',
  color: '#ffffff',
  borderRadius: 4,
  border: 'none',
  outline: 'none',
  padding: '10px 20px',
  cursor: 'pointer',
})

const TextError = styled(Typography)({
  fontSize: 12,
  minHeight: 18,
  color: 'red',
  lineHeight: '14px',
  marginTop: -14,
  wordBreak: 'break-word',
})

export default Signup
