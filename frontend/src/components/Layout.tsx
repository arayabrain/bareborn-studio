import { AppBar, Box, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { FC, useState } from 'react'
import { drawerWidth } from './FlowChart/FlowChart'
import Header from './Header'
import { KeyboardBackspace } from '@mui/icons-material'
import HomeIcon from '@mui/icons-material/Home'
import SourceIcon from '@mui/icons-material/Source'
import StorageIcon from '@mui/icons-material/Storage'
import GroupIcon from '@mui/icons-material/Group'

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
        <MenuItem isClose={width !== drawerWidth}>
          <HomeIcon />
          <TypographyMenu style={{ opacity: Number(width === drawerWidth) }}>
            Dashboard
          </TypographyMenu>
        </MenuItem>
        <MenuItem isClose={width !== drawerWidth}>
          <StorageIcon />
          <TypographyMenu style={{ opacity: Number(width === drawerWidth) }}>
            Database
          </TypographyMenu>
        </MenuItem>
        <MenuItem isClose={width !== drawerWidth}>
          <SourceIcon />
          <TypographyMenu style={{ opacity: Number(width === drawerWidth) }}>
            Project
          </TypographyMenu>
        </MenuItem>
        <MenuItem isClose={width !== drawerWidth}>
          <SourceIcon />
          <TypographyMenu style={{ opacity: Number(width === drawerWidth) }}>
            Project
          </TypographyMenu>
        </MenuItem>
        <MenuItem isClose={width !== drawerWidth}>
          <GroupIcon />
          <TypographyMenu style={{ opacity: Number(width === drawerWidth) }}>
            Account Manager
          </TypographyMenu>
        </MenuItem>
      </MenuList>
    </MenuLeftWrapper>
  )
}

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
  shouldForwardProp: (props) => props !== 'isClose',
})<{ isClose: boolean }>(({ isClose }) => ({
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
