import { Box, IconButton, Modal, styled } from '@mui/material'
import { FC, useEffect, useRef, useState } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import ChangeDrag from './ChangeSize'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import { Object } from 'pages/Database'

type ImageViewProps = {
  open: boolean
  onClose?: () => void
  onNext?: () => void
  onPrevious?: () => void
  url?: string
  jsonData?: Object
  disabled?: { left: boolean; right: boolean }
}

const ImageView: FC<ImageViewProps> = ({
  open,
  onClose,
  url,
  onNext,
  onPrevious,
  jsonData,
  disabled,
}) => {
  const viewerRef = useRef<any>()
  const [worldCoords, setWorldCoords] = useState({ x: 0, y: 0, z: 0 })
  const [voxelCoords, setVoxelCoords] = useState({ i: 0, j: 0, k: 0 })
  const [values, setValues] = useState(0)
  const [opacity, setOpacity] = useState(0)
  const [thresholds, setThresholds] = useState(0)
  const [maxThres, setMaxThres] = useState(0)
  const [contracts, setContracts] = useState(1)
  const [brightness, setBrightness] = useState(0)
  const [isLoadFile, setIsLoadFile] = useState(false)
  const volumes = useRef<any>()

  useEffect(() => {
    if (open) {
      setTimeout(loadFile, 0)
      return
    }
    setIsLoadFile(false)
    setOpacity(0)
    setContracts(1)
    setBrightness(0)
    //eslint-disable-next-line
  }, [open])

  useEffect(() => {
    loadFileIndex()
    //eslint-disable-next-line
  }, [url])

  const onChangeThreshold = (num: number) => {
    if (!volumes.current) return
    volumes.current.intensity_min = num
    viewerRef.current.redrawVolumes()
  }

  const onChangeContract = (num: number) => {
    if (!volumes.current) return
    setContracts(num)
    volumes.current.display.setContrast(num)
    volumes.current.display.refreshPanels()
    viewerRef.current.redrawVolumes()
  }

  const onChangeBrightness = (num: number) => {
    if (!volumes.current) return
    setBrightness(num)
    volumes.current.display.setBrightness(num)
    volumes.current.display.refreshPanels()
    viewerRef.current.redrawVolumes()
  }

  const onChangeMinThresh = (num: number) => {
    if (!volumes.current) return
    volumes.current.intensity_min = num
    viewerRef.current.redrawVolumes()
  }

  const onChangeJson = () => {}

  const loadFileIndex = () => {
    if (!url || isLoadFile || !viewerRef.current) return
    setIsLoadFile(true)
    viewerRef.current.clearVolumes()
    viewerRef.current.loadVolumes({
      volumes: [
        {
          type: 'nifti1',
          nii_url: url,
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
  }

  const loadFile = () => {
    if (!url || isLoadFile) return
    setIsLoadFile(true)
    const brainbrowser = (window as any).BrainBrowser
    const color_map_config = brainbrowser.config.get('color_maps')[2]
    viewerRef.current = brainbrowser.VolumeViewer.start(
      'brainbrowser',
      (viewer: any) => {
        viewer.addEventListener('volumeloaded', function () {
          setOpacity(1)
          setIsLoadFile(false)
        })
        viewer.addEventListener('sliceupdate', function (event: any) {
          // const panel = event.target
          const { volume } = event
          volumes.current = volume
          setThresholds(volumes.current.intensity_min)
          setMaxThres(volumes.current.intensity_max)
          setValues(volume.getIntensityValue())
          if (brainbrowser.utils.isFunction(volume.getWorldCoords)) {
            setWorldCoords(volume.getWorldCoords())
          }
          if (brainbrowser.utils.isFunction(volume.getVoxelCoords)) {
            setVoxelCoords(volume.getVoxelCoords())
          }
        })
        const { url: urlColor, cursor_color } = color_map_config
        viewer.loadDefaultColorMapFromURL(urlColor, cursor_color)
        viewer.setDefaultPanelSize(256, 256)
        viewer.render()
        viewer.clearVolumes()
        viewer.loadVolumes({
          volumes: [
            {
              type: 'nifti1',
              nii_url: url,
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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
        }}
      >
        <ImageViewWrapper>
          <div
            style={{
              display: !opacity ? 'none' : 'flex',
              alignItems: 'stretch',
            }}
          >
            <div id="brainbrowser-wrapper">
              <div
                id="volume-viewer"
                style={{
                  minWidth: 768,
                  minHeight: 256,
                  background: '#ffffff',
                }}
              >
                <div id="brainbrowser"></div>
              </div>
              {opacity ? (
                <BoxContentData>
                  <p style={{ margin: 0, padding: '20px 0' }}>
                    World Coordinates:
                  </p>
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
                    onChangeMin={onChangeMinThresh}
                    max={maxThres}
                    min={-maxThres}
                    title={'Threshold'}
                    value={thresholds}
                    showInputMax
                    showInputMin
                    onChange={onChangeThreshold}
                  />
                  <ChangeDrag
                    title={'Contrast (0.0 to 2.0)'}
                    value={contracts}
                    onChange={onChangeContract}
                  />
                  <ChangeDrag
                    title={'Brightness (-1 to 1):'}
                    value={brightness}
                    min={-1}
                    max={1}
                    onChange={onChangeBrightness}
                  />
                </BoxContentData>
              ) : null}
            </div>
            <WrapperJson>
              <TextArea
                onChange={onChangeJson}
                value={JSON.stringify(jsonData || '')}
              />
            </WrapperJson>
            {!disabled?.right ? (
              <ButtonNext onClick={onNext}>
                <ArrowForwardIosIconWrapper />
              </ButtonNext>
            ) : null}
            {!disabled?.left ? (
              <ButtonPrevious onClick={onPrevious}>
                <ArrowBackIosIconWrapper />
              </ButtonPrevious>
            ) : null}
          </div>
          {(!opacity || isLoadFile) && (
            <BoxLoading>
              <img
                src="/lib/loading.gif"
                alt="icon loading"
                style={{ width: 80, height: 80 }}
              />
            </BoxLoading>
          )}
          <ButtonClose onClick={onClose}>
            <CloseIconWrapper />
          </ButtonClose>
        </ImageViewWrapper>
      </div>
    </Modal>
  )
}

const BoxLoading = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255,255,255, 0.1)',
  zIndex: 88,
})

const ButtonClose = styled(IconButton)({
  width: 50,
  height: 50,
  position: 'absolute',
  top: '10%',
  right: '10%',
  zIndex: 9999,
  background: 'rgba(255,255,255,0.4)',
})

const ButtonNext = styled(ButtonClose)({
  width: 50,
  height: 50,
  position: 'absolute',
  top: '50%',
  right: '10%',
  zIndex: 1,
})

const ButtonPrevious = styled(ButtonClose)({
  width: 50,
  height: 50,
  position: 'absolute',
  top: '50%',
  left: '10%',
  zIndex: 1,
})

const ImageViewWrapper = styled(Box)({
  marginTop: 48,
  overflow: 'auto',
  margin: 'auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

const BoxContentData = styled(Box)({
  margin: '-5px 0 0',
  padding: '10px',
  background: '#ffffff',
})

const WrapperJson = styled(Box)({
  minWidth: 300,
  background: '#ffffff',
})

const TextArea = styled('textarea')({
  height: 'calc(100% - 7px)',
  width: '100%',
  outline: 'none !important',
  border: 'none',
  borderLeft: '1px solid',
})

const CloseIconWrapper = styled(CloseIcon)({
  color: '#ffffff',
})

const ArrowBackIosIconWrapper = styled(ArrowBackIosIcon)({
  color: '#ffffff',
  marginLeft: 10,
})

const ArrowForwardIosIconWrapper = styled(ArrowForwardIosIcon)({
  color: '#ffffff',
})

export default ImageView
