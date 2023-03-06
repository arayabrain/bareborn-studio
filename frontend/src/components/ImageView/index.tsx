import { Box, Modal, styled } from '@mui/material'
import { FC, useEffect, useRef, useState } from 'react'

type ImageViewProps = {
  open: boolean
  onClose?: () => void
}

const ImageView: FC<ImageViewProps> = ({ open, onClose }) => {
  const viewerRef = useRef<any>()
  const [worldCoords, setWorldCoords] = useState({ x: 0, y: 0, z: 0 })
  const [voxelCoords, setVoxelCoords] = useState({ i: 0, j: 0, k: 0 })
  const [values, setValues] = useState(0)

  useEffect(() => {
    if (open)
      setTimeout(() => {
        loadFile()
      }, 500)
  }, [open])

  const loadFile = () => {
    const brainbrowser = (window as any).BrainBrowser
    const color_map_config = brainbrowser.config.get('color_maps')[2]
    viewerRef.current = brainbrowser.VolumeViewer.start(
      'brainbrowser',
      (viewer: any) => {
        viewer.addEventListener('volumeloaded', function (event: any) {
          console.log('render')
        })
        viewer.addEventListener('sliceupdate', function (event: any) {
          // const panel = event.target
          const { volume } = event
          console.log('volume', volume)
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
      <ImageViewWrapper>
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
            </BoxContentData>
          </div>
        </div>
      </ImageViewWrapper>
    </Modal>
  )
}

const ImageViewWrapper = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  background: 'rgba(255,255,255,0.7)',
})

const BoxContentData = styled(Box)({})

export default ImageView
