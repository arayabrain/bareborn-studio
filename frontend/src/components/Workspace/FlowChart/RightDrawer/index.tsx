import { FC } from "react"
import { useSelector, useDispatch } from "react-redux"

import { Launch } from "@mui/icons-material"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import { Tooltip } from "@mui/material"
import Box from "@mui/material/Box"
import Divider from "@mui/material/Divider"
import Drawer, { drawerClasses } from "@mui/material/Drawer"
import IconButton from "@mui/material/IconButton"
import { styled } from "@mui/material/styles"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"

import { NWBSettingContents } from "components/Workspace/FlowChart/RightDrawer/NWBSettingContents"
import { ParamFormContents } from "components/Workspace/FlowChart/RightDrawer/ParamFormContents"
import { SnakemakeSettingContents } from "components/Workspace/FlowChart/RightDrawer/SnakemakeSettingContents"
import { RIGHT_DRAWER_WIDTH } from "const/Layout"
import {
  selectRightDrawerIsOpen,
  selectRightDrawerMode,
} from "store/slice/RightDrawer/RightDrawerSelectors"
import {
  closeRightDrawer,
  RIGHT_DRAWER_MODE,
} from "store/slice/RightDrawer/RightDrawerSlice"
import { RootState } from "store/store"

const RightDrawer: FC = () => {
  const open = useSelector(selectRightDrawerIsOpen)
  const dispatch = useDispatch()
  const onClick = () => dispatch(closeRightDrawer())
  const title = useSelector((state: RootState) => {
    const mode = selectRightDrawerMode(state)
    switch (mode) {
      case RIGHT_DRAWER_MODE.NWB:
        return "NWB Setting"
      case RIGHT_DRAWER_MODE.PARAM_FORM:
        return "Param Form"
      case RIGHT_DRAWER_MODE.SNAKEMAKE:
        return "Snakemake"
      default:
        return "none"
    }
  })
  const readTheDocsUrl = "https://optinist.readthedocs.io/en/latest"
  const useRightDrawerSettings = () => {
    const mode = useSelector((state: RootState) => selectRightDrawerMode(state))

    const titleLink =
      mode === RIGHT_DRAWER_MODE.NWB
        ? `${readTheDocsUrl}/gui/workflow.html#nwb-setting`
        : mode === RIGHT_DRAWER_MODE.SNAKEMAKE
          ? `${readTheDocsUrl}/gui/workflow.html#snakemane-settings`
          : ""

    const showLaunch =
      mode === RIGHT_DRAWER_MODE.NWB || mode === RIGHT_DRAWER_MODE.SNAKEMAKE

    return { titleLink, showLaunch }
  }
  const { titleLink, showLaunch } = useRightDrawerSettings()
  return (
    <StyledDrawer open={open} anchor="right" variant="persistent">
      <Toolbar />
      <Box display="flex" alignItems="center">
        <IconButton color="inherit" onClick={onClick} size="large">
          <ChevronRightIcon />
        </IconButton>
        <Typography variant="h6">{title}</Typography>
        {showLaunch && (
          <a
            href={titleLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginLeft: "5px",
              marginRight: "10px",
            }}
          >
            <Tooltip title="Check Documentation">
              <Launch style={{ fontSize: "16px" }} />
            </Tooltip>
          </a>
        )}
      </Box>
      <Divider />
      <MainContents>
        <Contents />
      </MainContents>
    </StyledDrawer>
  )
}

const Contents: FC = () => {
  const mode = useSelector(selectRightDrawerMode)
  switch (mode) {
    case RIGHT_DRAWER_MODE.NWB:
      return <NWBSettingContents />
    case RIGHT_DRAWER_MODE.PARAM_FORM:
      return <ParamFormContents />
    case RIGHT_DRAWER_MODE.SNAKEMAKE:
      return <SnakemakeSettingContents />
    default:
      return null
  }
}

const StyledDrawer = styled(Drawer)({
  width: RIGHT_DRAWER_WIDTH,
  flexShrink: 0,
  [`& .${drawerClasses.paper}`]: {
    width: RIGHT_DRAWER_WIDTH,
  },
})

const MainContents = styled("main")({
  height: "100%",
})

export default RightDrawer
