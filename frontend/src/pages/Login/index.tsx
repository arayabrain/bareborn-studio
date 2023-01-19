import { Box, Stack, styled, Typography } from '@mui/material'
import { ChangeEvent, FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'

const Login = () => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({
    email: '',
    password: '',
  })
  const [values, setValues] = useState<{ email: string; password: string }>({
    email: '',
    password: '',
  })

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    //todo call api.
  }

  const onChangeValue = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setValues({ ...values, [name]: value })
    setErrors({ ...errors, [name]: !value ? 'This field is required' : '' })
  }

  return (
    <LoginWrapper>
      <LoginContent>
        <Title>Sign in to your account</Title>
        <FormSignUp onSubmit={onSubmit}>
          <Box sx={{ position: 'relative' }}>
            <LabelField>
              Email<LableRequired>*</LableRequired>
            </LabelField>
            <Input
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
            <LinkWrappper to="/reset-password">Reset password</LinkWrappper>
          </Description>
          <Stack
            flexDirection="row"
            gap={2}
            mt={1}
            alignItems="center"
            justifyContent="space-between"
          >
            <Description>
              No Account
              <LinkWrappper to="/signup">Create Account</LinkWrappper>
            </Description>
            <ButtonLogin type="submit">Sign in</ButtonLogin>
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

const FormSignUp = styled('form')({})

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
  console.log('error', error)
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

const Description = styled(Typography)({
  fontSize: 12,
  color: 'rgba(0, 0, 0, 0.65)',
})

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
  color: 'red',
  position: 'absolute',
  bottom: -4,
})

export default Login
