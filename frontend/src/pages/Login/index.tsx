import { Box, Stack, styled, Typography } from '@mui/material'
import { getMe, login } from 'api/auth'
import { useUser } from 'providers'
import { ChangeEvent, FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveToken } from 'utils/auth'

const Login = () => {
  const { setUser } = useUser()
  const navigate = useNavigate()

  const [errors, setErrors] = useState<{ [key: string]: string }>({
    email: '',
    password: '',
  })
  const [values, setValues] = useState<{ email: string; password: string }>({
    email: '',
    password: '',
  })

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const errorCheck = validateSubmit()
    if (errors.email || errors.password || errorCheck) return
    try {
      const { access_token } = await login(values)
      saveToken(access_token)
      getUser()
    } catch (e) {
      setErrors({ email: 'Email or password is wrong', password: '' })
    }
  }

  const getUser = async () => {
    const data = await getMe()
    setUser(data)
    navigate('/')
  }

  const validateSubmit = () => {
    let errors = { email: '', password: '' }
    if (!values.email) {
      errors.email = 'This field is required'
    }
    if (!values.password) {
      errors.password = 'This field is required'
    }
    setErrors(errors)
    return errors.password || errors.email
  }

  const onChangeValue = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setValues({ ...values, [name]: value })
    setErrors({ ...errors, [name]: !value ? 'This field is required' : '' })
  }

  const onClickResetPass = () => {
    navigate('/reset-password')
  }

  return (
    <LoginWrapper>
      <LoginContent>
        <Title>Sign in to your account</Title>
        <FormSignUp autoComplete="off" onSubmit={onSubmit}>
          <Box sx={{ position: 'relative' }}>
            <LabelField>
              Email<LableRequired>*</LableRequired>
            </LabelField>
            <Input
              autoComplete="off"
              error={!!errors.email}
              name="email"
              onChange={onChangeValue}
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
              onChange={onChangeValue}
              name="password"
              type="password"
              value={values.password}
              placeholder="Enter your password"
            />
            <TextError>{errors.password}</TextError>
          </Box>
          <Description>
            Forgot your password?
            <LinkWrappperText onClick={onClickResetPass}>Reset password</LinkWrappperText>
          </Description>
          <Stack
            flexDirection="row"
            gap={2}
            mt={3}
            alignItems="center"
            justifyContent="flex-end"
          >
            <ButtonLogin type="submit">SIGN IN</ButtonLogin>
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
  boxShadow: '2px 1px 3px 1px rgba(0,0,0,0.1)',
  borderRadius: 4,
})

const Title = styled(Typography)({
  fontSize: 15,
  fontWeight: 600,
  marginBottom: 24,
})

const FormSignUp = styled('form')({})

const LabelField = styled(Typography)({
  fontSize: 14,
})

const LableRequired = styled('span')({
  color: 'red',
  fontSize: 14,
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
    marginBottom: 22,
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

// const LinkWrappper = styled(Link)({
//   marginLeft: 6,
//   color: '#1892d1',
// })

const LinkWrappperText = styled('span')({
  marginLeft: 6,
  color: '#1892d1',
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
  color: 'red',
  position: 'absolute',
  bottom: 4,
})

export default Login
