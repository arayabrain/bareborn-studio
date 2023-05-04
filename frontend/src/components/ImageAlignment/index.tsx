import {Box, Button, IconButton, Modal, styled} from '@mui/material'
import { FC, useEffect, useRef, useState } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import { Object } from 'pages/Database'

type ImageViewProps = {
    open: boolean
    onClose?: () => void
    onNext?: () => void
    onPrevious?: () => void
    urls: string[]
    jsonData?: Object
    disabled?: { left: boolean; right: boolean }
}

const ImageAlignment: FC<ImageViewProps> =
    ({
       open,
       onClose,
       urls,
     }) => {
    const viewerRef = useRef<any>()
    const [url, setUrl] = useState(urls[0])
    const [worldCoords, setWorldCoords] = useState({ x: 0, y: 0, z: 0 })
    const [voxelCoords, setVoxelCoords] = useState({ i: 0, j: 0, k: 0 })
    const [opacity, setOpacity] = useState(0)
    const [isLoadFile, setIsLoadFile] = useState(false)
    const volumes = useRef<any>()

    useEffect(() => {
        if (open) {
            setTimeout(loadFile, 0)
            return
        }
        setOpacity(0)
        //eslint-disable-next-line
    }, [open])

    useEffect(() => {
        loadFileIndex()
        //eslint-disable-next-line
    }, [url])

    const onPreImage = () => {
        const index = urls.findIndex(item => item === url)
        if(index === 0) return
        setUrl(urls[index+1])
    }

    const onNextImage = () => {
        const index = urls.findIndex(item => item === url)
        if(index === urls.length - 1) return
        setUrl(urls[index-1])
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
                            <Flex>
                                <BoxSet>
                                    <ContentSet>
                                        <Flex>
                                            <Text>right {'{mm}'}</Text>
                                            <input
                                                value={worldCoords.x.toPrecision(4)}
                                                onChange={(e) => setWorldCoords({...worldCoords, x: Number(e.target.value)})}
                                            />
                                        </Flex>
                                        <Flex>
                                            <Text>forward {'{mm}'}</Text>
                                            <input
                                                value={worldCoords.y.toPrecision(4)}
                                                onChange={(e) => setWorldCoords({...worldCoords, y: Number(e.target.value)})}
                                            />
                                        </Flex>
                                        <Flex>
                                            <Text>up {'{mm}'}</Text>
                                            <input
                                                value={worldCoords.z.toPrecision(4)}
                                                onChange={(e) => setWorldCoords({...worldCoords, z: Number(e.target.value)})}
                                            />
                                        </Flex>
                                        <Flex>
                                            <Text>pitch {'{rad}'}</Text>
                                            <input
                                                value={worldCoords.x.toPrecision(4)}
                                                onChange={(e) => setWorldCoords({...worldCoords, z: Number(e.target.value)})}
                                            />
                                        </Flex>
                                        <Flex>
                                            <Text>pitch {'{rad}'}</Text>
                                            <input
                                                value={worldCoords.x.toPrecision(4)}
                                                onChange={(e) => setWorldCoords({...worldCoords, z: Number(e.target.value)})}
                                            />
                                        </Flex>
                                        <Flex>
                                            <Text>yaw {'{rad}'}</Text>
                                            <input
                                                value={worldCoords.x.toPrecision(4)}
                                                onChange={(e) => setWorldCoords({...worldCoords, z: Number(e.target.value)})}
                                            />
                                        </Flex>
                                        <Flex>
                                            <Text>resize {'{x}'}</Text>
                                            <input
                                                value={voxelCoords.k.toPrecision(4)}
                                                onChange={(e) => setVoxelCoords({...voxelCoords, k: Number(e.target.value)})}
                                            />
                                        </Flex>
                                        <Flex>
                                            <Text>resize {'{y}'}</Text>
                                            <input
                                                value={voxelCoords.i.toPrecision(4)}
                                                onChange={(e) => setVoxelCoords({...voxelCoords, i: Number(e.target.value)})}
                                            />
                                        </Flex>
                                        <Flex>
                                            <Text>resize {'{z}'}</Text>
                                            <input
                                                value={voxelCoords.j.toPrecision(4)}
                                                onChange={(e) => setVoxelCoords({...voxelCoords, j: Number(e.target.value)})}
                                            />
                                        </Flex>
                                        <ButtonSet>
                                            Set Origin
                                        </ButtonSet>
                                    </ContentSet>
                                </BoxSet>
                                <Flex sx={{
                                    flexDirection: 'column',
                                    position: 'relative',
                                    gap: 15,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                    <SwitchImage>
                                        <span>Select Image</span>
                                        <SwitchContent>
                                            <ButtonPrevious onClick={onPreImage}>{'<'}</ButtonPrevious>
                                            <InputImage value={url} readOnly/>
                                            <ButtonNext onClick={onNextImage}>{'>'}</ButtonNext>
                                        </SwitchContent>
                                    </SwitchImage>
                                    <Flex sx={{gap: 5}}>
                                        <ButtonCanCel onClick={onClose}>CANCEL</ButtonCanCel>
                                        <ButtonOk onClick={onClose}>OK</ButtonOk>
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
})

const ButtonNext = styled(ButtonClose)({
    width: 50,
    height: 50,
    display: 'block',
    position: 'unset',
    right: '10%',
    zIndex: 1,
})

const ButtonPrevious = styled(ButtonClose)({
    width: 50,
    height: 50,
    position: 'unset',
    zIndex: 1,
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
    backgroundColor: '#fff'
})

const ContentSet = styled(Box)({
    padding: 20
})

const Flex = styled(Box)({
    display: 'flex'
})

const Text = styled('span')({
    display: "block",
    minWidth: 150
})

const ButtonSet = styled('button')({
    marginTop : 20,
    cursor: 'pointer'
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
    flexDirection: 'column'
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
    cursor: 'pointer'
})

const ButtonCanCel = styled('button')({
    padding: 10,
    border: '2px solid #000',
    cursor: 'pointer'
})

const CloseIconWrapper = styled(CloseIcon)({
    color: '#ffffff',
})

export default ImageAlignment
