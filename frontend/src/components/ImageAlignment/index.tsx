import { Box, IconButton, Modal, styled } from '@mui/material'
import { ChangeEvent, FC, useEffect, useRef, useState } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import { Object } from 'pages/Database'
import { selectNodeById } from 'store/slice/FlowElement/FlowElementSelectors'
import { useSelector, useDispatch } from 'react-redux'
import { editFlowElementParamsAlignmentById } from 'store/slice/FlowElement/FlowElementSlice'
import { Params } from 'store/slice/FlowElement/FlowElementType'

type ImageViewProps = {
  open: boolean
  onClose?: () => void
  onNext?: () => void
  onPrevious?: () => void
  urls: string[]
  jsonData?: Object
  disabled?: { left: boolean; right: boolean }
  params?: { [key: string]: string | undefined }
}

const ImageAlignment: FC<ImageViewProps> = ({
  open,
  onClose,
  urls,
  params = {},
}) => {
  const viewerRef = useRef<any>()
  const [url, setUrl] = useState(urls[0])
  const [isLoadFile, setIsLoadFile] = useState(false)
  const [loadedSuccess, setLoadedSuccess] = useState(false)
  const volumes = useRef<any>()
  const dispatch = useDispatch()

  const flowElement = useSelector(selectNodeById(params?.nodeId as string))

  const [stateParams, setStateParams] = useState<Params | undefined>(
    flowElement?.data?.params,
  )

  useEffect(() => {
    if (open) {
      setTimeout(loadFile, 0)
      return
    }
    //eslint-disable-next-line
  }, [open])

  useEffect(() => {
    loadFileIndex()
    //eslint-disable-next-line
  }, [url])

  useEffect(() => {
    if (loadedSuccess) {
      setInitBrainbrowser()
    }
    //eslint-disable-next-line
  }, [loadedSuccess])

  const onOk = () => {
    if (params?.nodeId && stateParams) {
      dispatch(
        editFlowElementParamsAlignmentById({
          nodeId: params.nodeId,
          params: stateParams,
        }),
      )
    }
    onClose?.()
  }

  const onPreImage = () => {
    const index = urls.findIndex((item) => item === url)
    if (index === 0) return
    setUrl(urls[index - 1])
  }

  const onNextImage = () => {
    const index = urls.findIndex((item) => item === url)
    if (index === urls.length - 1) return
    setUrl(urls[index + 1])
  }

  const setInitBrainbrowser = () => {
    const paramsStore = flowElement?.data?.params
    if (paramsStore) {
      volumes.current.setResize({
        x: Number(paramsStore.x_resize),
        y: Number(paramsStore.y_resize),
        z: Number(paramsStore.z_resize),
      })
      volumes.current.setVoxelCoords(
        Number(paramsStore.y_pos),
        Number(paramsStore.z_pos),
        Number(paramsStore.x_pos),
        
      )
      volumes.current.setRadian(
        Number(paramsStore.y_rotate),
        Number(paramsStore.x_rotate),
        Number(paramsStore.z_rotate),
      )
    }
    viewerRef.current.redrawVolumes()
  }

  const onSetOrigin = () => {
    if (stateParams) {
      volumes.current.setResize({
        x: Number(stateParams.x_resize),
        y: Number(stateParams.y_resize),
        z: Number(stateParams.z_resize),
      })
      volumes.current.setVoxelCoords(
        Number(stateParams.y_pos),
        Number(stateParams.z_pos),
        Number(stateParams.x_pos),
      )
      volumes.current.setRadian(
        Number(stateParams.y_rotate),
        Number(stateParams.x_rotate),
        Number(stateParams.z_rotate),
      )
    }
    viewerRef.current.redrawVolumes()
  }

  const onChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (params?.nodeId && stateParams) {
      setStateParams({ ...stateParams, [name]: value })
    }
  }

  const onBlurRadian = (e: any) => {
    const { name, value } = e.target
    let valueRadian = Number(value)
    if (isNaN(valueRadian)) {
      valueRadian = 0
    } else if (valueRadian < 0) {
      valueRadian = 0
    } else if (valueRadian > 2 * Math.PI) {
      valueRadian = 0
    }
    if (params?.nodeId && stateParams) {
      setStateParams({ ...stateParams, [name]: value })
    }
  }

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
    setLoadedSuccess(false)
    const brainbrowser = (window as any).BrainBrowser
    const color_map_config = brainbrowser.config.get('color_maps')[2]
    viewerRef.current = brainbrowser.VolumeViewer.start(
      'brainbrowser',
      (viewer: any) => {
        viewer.addEventListener('volumeloaded', function () {
          setIsLoadFile(false)
          setLoadedSuccess(true)
        })
        viewer.addEventListener('sliceupdate', function (event: any) {
          const { volume } = event
          const paramsNode: Params = {
            x_pos: 0,
            y_pos: 0,
            z_pos: 0,
            x_rotate: volume.header.xspace.radian,
            y_rotate: volume.header.yspace.radian,
            z_rotate: volume.header.zspace.radian,
            x_resize: volume.header.xspace.step,
            y_resize: volume.header.yspace.step,
            z_resize: volume.header.zspace.step,
          }
          volumes.current = volume
          if (brainbrowser.utils.isFunction(volume.getVoxelCoords)) {
            const voxel = volume.getVoxelCoords()
            paramsNode.x_pos = voxel.k
            paramsNode.y_pos = voxel.i
            paramsNode.z_pos = voxel.j
          }
          setStateParams(paramsNode)
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
          <div style={{ alignItems: 'stretch' }}>
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
              <Flex>
                <BoxSet>
                  <ContentSet>
                    <Flex>
                      <Text>right {'{mm}'}</Text>
                      <input
                        type={'number'}
                        name="x_pos"
                        value={stateParams?.x_pos}
                        onChange={onChangeValue}
                      />
                    </Flex>
                    <Flex>
                      <Text>forward {'{mm}'}</Text>
                      <input
                        type={'number'}
                        name="y_pos"
                        value={stateParams?.y_pos}
                        onChange={onChangeValue}
                      />
                    </Flex>
                    <Flex>
                      <Text>up {'{mm}'}</Text>
                      <input
                        type={'number'}
                        name="z_pos"
                        value={stateParams?.z_pos}
                        onChange={onChangeValue}
                      />
                    </Flex>
                    <Flex>
                      <Text>roll {'{rad}'}</Text>
                      <input
                        name="x_rotate"
                        value={stateParams?.x_rotate}
                        onChange={onChangeValue}
                        onBlur={onBlurRadian}
                      />
                    </Flex>
                    <Flex>
                      <Text>pitch {'{rad}'}</Text>
                      <input
                        name="y_rotate"
                        value={stateParams?.y_rotate}
                        onChange={onChangeValue}
                        onBlur={onBlurRadian}
                      />
                    </Flex>
                    <Flex>
                      <Text>yaw {'{rad}'}</Text>
                      <input
                        name="z_rotate"
                        value={stateParams?.z_rotate}
                        onChange={onChangeValue}
                        onBlur={onBlurRadian}
                      />
                    </Flex>
                    <Flex>
                      <Text>resize {'{x}'}</Text>
                      <input
                        name="x_resize"
                        value={stateParams?.x_resize}
                        onChange={onChangeValue}
                      />
                    </Flex>
                    <Flex>
                      <Text>resize {'{y}'}</Text>
                      <input
                        value={stateParams?.y_resize}
                        name="y_resize"
                        onChange={onChangeValue}
                      />
                    </Flex>
                    <Flex>
                      <Text>resize {'{z}'}</Text>
                      <input
                        value={stateParams?.z_resize}
                        name="z_resize"
                        onChange={onChangeValue}
                      />
                    </Flex>
                    <ButtonSet onClick={onSetOrigin}>Set Origin</ButtonSet>
                  </ContentSet>
                </BoxSet>
                <Flex
                  sx={{
                    flexDirection: 'column',
                    position: 'relative',
                    gap: 15,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <SwitchImage>
                    <span>Select Image</span>
                    <SwitchContent>
                      <ButtonPre onClick={onPreImage}>{'<'}</ButtonPre>
                      <InputImage value={url} readOnly />
                      <ButtonNext onClick={onNextImage}>{'>'}</ButtonNext>
                    </SwitchContent>
                    <span>{`(${
                      urls.findIndex((item: string) => item === url) + 1
                    }/${urls.length})`}</span>
                  </SwitchImage>
                  <Flex sx={{ gap: 5 }}>
                    <ButtonCanCel onClick={onClose}>CANCEL</ButtonCanCel>
                    <ButtonOk onClick={onOk}>OK</ButtonOk>
                  </Flex>
                </Flex>
              </Flex>
            </div>
          </div>
          <ButtonClose onClick={onClose}>
            <CloseIconWrapper />
          </ButtonClose>
        </ImageViewWrapper>
      </div>
    </Modal>
  )
}

const ButtonClose = styled(IconButton)({
  width: 50,
  height: 50,
  position: 'absolute',
  right: '10%',
  top: '10%',
  zIndex: 9999,
  background: 'rgba(0, 0, 0, 0.6)',
  '&:hover': {
    background: 'rgba(0, 0, 0, 0.8)',
  },
})

const ButtonPre = styled('button')({
  width: 50,
  height: 50,
  position: 'unset',
  zIndex: 1,
  borderRadius: '50%',
  backgroundColor: 'unset',
  border: 'none',
  cursor: 'pointer',
  fontSize: 20,
  '&:hover': {
    background: 'rgba(0, 0, 0, 0.1)',
  },
})

const ButtonNext = styled(ButtonPre)({
  right: '10%',
})

const InputImage = styled('input')({
  height: 'fit-content',
})

const ImageViewWrapper = styled(Box)({
  marginTop: 48,
  overflow: 'auto',
  margin: 'auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#fff',
})

const ContentSet = styled(Box)({
  padding: 20,
})

const Flex = styled(Box)({
  display: 'flex',
})

const Text = styled('span')({
  display: 'block',
  minWidth: 150,
})

const ButtonSet = styled('button')({
  marginTop: 20,
  cursor: 'pointer',
})

const BoxSet = styled(Box)({
  border: '2px solid #000',
  width: 'fit-content',
  margin: '30px 50px',
})

const SwitchImage = styled(Box)({
  height: 'max-content',
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
})

const SwitchContent = styled(Box)({
  height: 'max-content',
  display: 'flex',
  alignItems: 'center',
})

const ButtonOk = styled('button')({
  padding: '10px 20px',
  background: '#000000c7',
  border: '2px solid #000',
  color: '#fff',
  cursor: 'pointer',
})

const ButtonCanCel = styled('button')({
  padding: 10,
  border: '2px solid #000',
  cursor: 'pointer',
})

const CloseIconWrapper = styled(CloseIcon)({
  color: '#ffffff',
})

export default ImageAlignment
