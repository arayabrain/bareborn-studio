import { Box, IconButton, Modal, styled } from '@mui/material'
import { FC, useEffect, useRef, useState } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import ChangeDrag from './ChangeSize'

type ImageViewProps = {
  open: boolean
  onClose?: () => void
}

const ImageView: FC<ImageViewProps> = ({ open, onClose }) => {
  const viewerRef = useRef<any>()
  const [worldCoords, setWorldCoords] = useState({ x: 0, y: 0, z: 0 })
  const [voxelCoords, setVoxelCoords] = useState({ i: 0, j: 0, k: 0 })
  const [values, setValues] = useState(0)
  const [opacity, setOpacity] = useState(0)
  const [thresholds, setThresholds] = useState(0)
  const volumes = useRef<any>()

  useEffect(() => {
    if (open) {
      setTimeout(loadFile, 0)
      return
    }
    setOpacity(0)
    setThresholds(0)
  }, [open])

  const onChangeThreshold = (num: number) => {
    if (!volumes.current) return
    setThresholds(num)
    volumes.current.intensity_min = num
    viewerRef.current.redrawVolumes()
  }

  const loadFile = () => {
    const brainbrowser = (window as any).BrainBrowser
    const color_map_config = brainbrowser.config.get('color_maps')[2]
    viewerRef.current = brainbrowser.VolumeViewer.start(
      'brainbrowser',
      (viewer: any) => {
        viewer.addEventListener('volumeloaded', function (event: any) {
          setOpacity(1)
        })
        viewer.addEventListener('sliceupdate', function (event: any) {
          // const panel = event.target
          const { volume } = event
          volumes.current = volume
          setValues(volume.getIntensityValue())
          if (brainbrowser.utils.isFunction(volume.getWorldCoords)) {
            setWorldCoords(volume.getWorldCoords())
          }
          if (brainbrowser.utils.isFunction(volume.getVoxelCoords)) {
            setVoxelCoords(volume.getVoxelCoords())
          }
        })
        const { url, cursor_color } = color_map_config
        viewer.loadDefaultColorMapFromURL(url, cursor_color)
        viewer.setDefaultPanelSize(256, 256)
        viewer.clearVolumes()
        viewer.render()
        viewer.loadVolumes({
          volumes: [
            {
              type: 'nifti1',
              nii_url: 'lib/functional.nii',
              template: {
                element_id: 'volume-ui-template',
                viewer_insert_className: 'volume-viewer-display',
              },
              overlay: {
                template: {
                  element_id: 'overlay-ui-template',
                  viewer_insert_className: 'overlay-viewer-display',
                },
              },
              complete: function () {},
            },
          ],
        })
      },
    )
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <ImageViewWrapper sx={{ opacity }}>
        <ButtonClose onClick={onClose}>
          <CloseIcon />
        </ButtonClose>
        <div>
          <div id="brainbrowser-wrapper">
            <div id="volume-viewer">
              <div id="brainbrowser"></div>
            </div>
            <BoxContentData>
              <p>World Coordinates:</p>
              <span>X: {worldCoords.x.toPrecision(4)}</span>
              <span style={{ marginLeft: 20 }}>
                Y: {worldCoords.y.toPrecision(4)}
              </span>
              <span style={{ marginLeft: 20 }}>
                Z: {worldCoords.z.toPrecision(4)}
              </span>
              <p>Voxel Coordinates:</p>
              <span>I: {voxelCoords.i}</span>
              <span style={{ marginLeft: 20 }}>J: {voxelCoords.j}</span>
              <span style={{ marginLeft: 20 }}>K: {voxelCoords.k}</span>
              <p>Value: {values}</p>
              <ChangeDrag
                max={255}
                title={'Threshold'}
                value={thresholds}
                onChange={onChangeThreshold}
              />
            </BoxContentData>
          </div>
        </div>
      </ImageViewWrapper>
    </Modal>
  )
}

const ButtonClose = styled(IconButton)({
  width: 50,
  height: 50,
  position: 'absolute',
  top: '10%',
  right: '10%',
})

const ImageViewWrapper = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  background: 'rgba(255,255,255,0.8)',
})

const BoxContentData = styled(Box)({})

export default ImageView
