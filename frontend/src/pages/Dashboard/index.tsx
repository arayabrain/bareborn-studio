import { Box, styled, Typography } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import SourceIcon from '@mui/icons-material/Source'
import StorageIcon from '@mui/icons-material/Storage'
import GroupIcon from '@mui/icons-material/Group'
import { Link } from 'react-router-dom'
import { useUser } from 'providers'

const Dashboard = () => {
  const { user } = useUser()
  return (
    <DashboardWrapper>
      <DashboardContent>
        <LinkWrapper to="/project">
          <BoxMenu>
            <Box>
              <TitleMenu>Project</TitleMenu>
              <StorageIcon fontSize="large" />
            </Box>
          </BoxMenu>
        </LinkWrapper>
        <LinkWrapper to="/database">
          <BoxMenu>
            <Box>
              <TitleMenu>Database</TitleMenu>
              <SourceIcon fontSize="large" />
            </Box>
          </BoxMenu>
        </LinkWrapper>
        <LinkWrapper to="/account">
          <BoxMenu>
            <Box>
              <TitleMenu>Account</TitleMenu>
              <HomeIcon fontSize="large" />
            </Box>
          </BoxMenu>
        </LinkWrapper>
        {user?.role === 'ADMIN' ? (
          <LinkWrapper to="/account-management">
            <BoxMenu>
              <Box>
                <TitleMenu>Account Management</TitleMenu>
                <GroupIcon fontSize="large" />
              </Box>
            </BoxMenu>
          </LinkWrapper>
        ) : null}
      </DashboardContent>
    </DashboardWrapper>
  )
}

const LinkWrapper = styled(Link)(() => ({
  textDecoration: 'none',
}))

const DashboardWrapper = styled(Box)(() => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}))

const DashboardContent = styled(Box)(() => ({
  padding: 30,
  display: 'flex',
  justifyContent: 'center',
  flexWrap: 'wrap',
  gap: 32,
}))

const BoxMenu = styled(Box)(() => ({
  width: 170,
  height: 150,
  backgroundColor: '#283237',
  borderRadius: 4,
  padding: '40px 30px',
  color: '#fff',
  textAlign: 'center',
  fontSize: 24,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s',
  '&:hover': {
    transform: 'scale(1.1)',
    backgroundColor: 'rgba(40,50,55,0.9)',
  },
}))

const TitleMenu = styled(Typography)(() => ({
  fontSize: 24,
  marginBottom: 40,
}))

export default Dashboard
