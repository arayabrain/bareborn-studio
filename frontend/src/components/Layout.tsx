import { Box, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { FC, useState } from 'react'
import { drawerWidth } from './FlowChart/FlowChart'
import Header from './Header'
import { KeyboardBackspace } from '@mui/icons-material'
import HomeIcon from '@mui/icons-material/Home'
import SourceIcon from '@mui/icons-material/Source'
import StorageIcon from '@mui/icons-material/Storage'
import GroupIcon from '@mui/icons-material/Group'
import { Link, useLocation } from 'react-router-dom'

const Layout: FC = ({ children }) => {
  return (
    <LayoutWrapper>
      <Header />
      <ContentBodyWrapper>
        <MenuLeft />
        <ChildrenWrapper>{children}</ChildrenWrapper>
      </ContentBodyWrapper>
    </LayoutWrapper>
  )
}

const MenuLeft: FC = () => {
  const [width, setWidth] = useState(drawerWidth)
  const { pathname } = useLocation()

  const onResize = () => {
    setWidth(width === drawerWidth ? 54 : drawerWidth)
  }

  return (
    <MenuLeftWrapper style={{ width, minWidth: width }}>
      <BoxBack>
        <ButtonBack
          onClick={onResize}
          style={{ transform: `rotate(${width === drawerWidth ? 0 : 180}deg)` }}
        >
          <BoxDivider />
          <KeyboardBackspaceIcon />
        </ButtonBack>
      </BoxBack>
      <MenuList>
        <LinkWrapper to="/">
          <MenuItem isClose={width !== drawerWidth} active={pathname === '/'}>
            <HomeIcon />
            <TypographyMenu style={{ opacity: Number(width === drawerWidth) }}>
              Dashboard
            </TypographyMenu>
          </MenuItem>
        </LinkWrapper>
        <LinkWrapper to="/database">
          <MenuItem
            isClose={width !== drawerWidth}
            active={pathname === '/database'}
          >
            <StorageIcon />
            <TypographyMenu style={{ opacity: Number(width === drawerWidth) }}>
              Database
            </TypographyMenu>
          </MenuItem>
        </LinkWrapper>
        <LinkWrapper to="/project">
          <MenuItem
            isClose={width !== drawerWidth}
            active={pathname === '/project'}
          >
            <SourceIcon />
            <TypographyMenu style={{ opacity: Number(width === drawerWidth) }}>
              Project
            </TypographyMenu>
          </MenuItem>
        </LinkWrapper>
        <LinkWrapper to="/account-management">
          <MenuItem
            isClose={width !== drawerWidth}
            active={pathname === '/account-management'}
          >
            <GroupIcon />
            <TypographyMenu style={{ opacity: Number(width === drawerWidth) }}>
              Account Manager
            </TypographyMenu>
          </MenuItem>
        </LinkWrapper>
      </MenuList>
    </MenuLeftWrapper>
  )
}

const LinkWrapper = styled(Link)(() => ({
  textDecoration: 'none',
}))

const LayoutWrapper = styled(Box)({
  height: '100%',
  width: '100%',
})

const ContentBodyWrapper = styled(Box)(() => ({
  backgroundColor: '#ffffff',
  display: 'flex',
  paddingTop: 48,
  height: 'calc(100% - 48px)',
  paddingRight: 10,
}))

const ChildrenWrapper = styled(Box)(() => ({
  width: '100%',
  height: 'calc(100% - 10px)',
  display: 'flex',
  paddingTop: 10,
  paddingLeft: 10,
}))

const MenuLeftWrapper = styled(Box)({
  height: '100%',
  backgroundColor: '#283237',
  overflow: 'auto',
  transition: 'all 0.3s',
})

const BoxBack = styled(Box)({
  width: '100%',
  height: 54,
  display: 'flex',
  justifyContent: 'flex-end',
})

const ButtonBack = styled(Box)({
  height: 54,
  width: 54,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
})

const BoxDivider = styled(Box)({
  height: 15,
  width: 1,
  backgroundColor: '#ffffff',
  marginRight: -2,
})

const KeyboardBackspaceIcon = styled(KeyboardBackspace)({
  color: '#ffffff',
  fontSize: 20,
})

const MenuList = styled('ul')({
  margin: 0,
  padding: 0,
})

const MenuItem = styled('li', {
  shouldForwardProp: (props) => props !== 'isClose' && props !== 'active',
})<{ isClose: boolean; active: boolean }>(({ isClose, active }) => ({
  padding: '0 15px',
  color: '#ffffff',
  listStyle: 'none',
  height: 38,
  minHeight: 38,
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  width: '100%',
  minWidth: 'max-content',
  transition: 'all 0.3s',
  cursor: 'pointer',
  backgroundColor: active ? 'rgba(255,255,255,0.4) !important' : 'transparent',
  '&:hover': {
    transform: isClose
      ? 'scale(1.05) translateX(2px)'
      : 'scale(1.05) translateX(10px)',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
}))

const TypographyMenu = styled(Typography)({
  lineHeight: '20px',
  marginTop: 4,
  fontWeight: 500,
  transition: 'opacity 0.3s',
})

export default Layout
