import { Box, styled, Typography } from '@mui/material'
import SignUp from 'components/SignUp'

const Signup = () => {
  return (
    <LoginWrapper>
      <LoginContent>
        <Title>Create new your account</Title>
        <SignUp isLogin />
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

export default Signup
