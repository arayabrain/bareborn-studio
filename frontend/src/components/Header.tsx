import { Box, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { FC } from 'react'

const Header: FC = () => {
  return (
    <HeaderWrapper>
      <Typography>Logo</Typography>
      <Typography>Logout</Typography>
    </HeaderWrapper>
  )
}

const HeaderWrapper = styled(Box)({
  height: 48,
  backgroundColor: '#E1DEDB',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  color: 'rgba(0, 0, 0, 0.87)',
  boxShadow:
    '0px 2px 4px -1px rgb(0 0 0 / 20%), 0px 4px 5px 0px rgb(0 0 0 / 14%), 0px 1px 10px 0px rgb(0 0 0 / 12%)',
  position: 'fixed',
  width: 'calc(100% - 20px)',
  padding: '0 10px',
})

export default Header
