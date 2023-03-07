import { Box, styled, SxProps, Theme, Typography } from '@mui/material'
import {
  FC,
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  TouchEvent,
} from 'react'

type ChangeDragProps = {
  title: string
  value: number
  onChange: (value: number) => void
  className?: string
  max?: number
}

const ChangeDrag: FC<ChangeDragProps> = ({
  title,
  value,
  onChange,
  className,
  max = 2,
}) => {
  const [width, setWidth] = useState(0)
  const mouseDown = useRef(0)

  const refDrag = useRef<any>()
  const refDot = useRef<any>()

  useEffect(() => {
    setTimeout(() => {
      setWidth(refDrag.current.clientWidth)
    }, 1000)
  }, [])

  const onMouseDown = useCallback((event: MouseEvent<HTMLDivElement>) => {
    mouseDown.current = event.pageX
    refDrag.current.style.cursor = 'grabbing'
    refDot.current.style.cursor = 'grabbing'
  }, [])

  const onTouchStart = useCallback((event: TouchEvent<HTMLDivElement>) => {
    mouseDown.current = event.touches[0].pageX
    refDrag.current.style.cursor = 'grabbing'
    refDot.current.style.cursor = 'grabbing'
  }, [])

  const onMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!mouseDown.current) return
    const mouseInit = refDrag.current.getBoundingClientRect().x
    const mouseMove = event.pageX - mouseInit
    let scale = (mouseMove * max) / width
    if (scale > max) scale = max
    if (scale < 0) scale = 0
    onChange(Number(scale.toFixed(2)))
  }

  const onTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    if (!mouseDown.current) return
    const mouseInit = refDrag.current.getBoundingClientRect().x
    const mouseMove = event.touches[0].pageX - mouseInit
    let scale = (mouseMove * max) / width
    if (scale > max) scale = max
    if (scale < 0) scale = 0
    onChange(Number(scale.toFixed(2)))
  }

  const onMouseLeave = useCallback(() => {
    mouseDown.current = 0
    refDrag.current.style.cursor = 'default'
    refDot.current.style.cursor = ''
  }, [])

  console.log('width',value * (width / max))

  return (
    <ScaleWrapper
      className={className}
      ref={refDrag}
      onMouseMove={onMouseMove}
      onTouchMove={onTouchMove}
      onMouseLeave={onMouseLeave}
      onMouseUp={onMouseLeave}
    >
      <TitleScale>{title}</TitleScale>
      <BoxWrapper>
        <BoxLine sx={{ width: value * (width / max) }} />
        <Dot
          ref={refDot}
          onMouseDown={onMouseDown}
          onTouchEnd={onMouseLeave}
          onTouchStart={onTouchStart}
          sx={{ left: value * (width / max) - 14 }}
        />
      </BoxWrapper>
    </ScaleWrapper>
  )
}

const BoxWrapper = styled(Box)(() => ({
  width: '100%',
  height: 4,
  background: 'rgba(60, 60, 67, 0.18)',
  position: 'relative',
  borderRadius: 2,
  userSelect: 'none',
}))

const Dot = styled(Box)(() => ({
  position: 'absolute',
  width: 28,
  height: 28,
  background: '#ffffff',
  borderRadius: 100,
  top: -12,
  cursor: 'pointer',
}))

const TitleScale = styled(Typography)(() => ({
  color: '#ffffff',
  fontSize: 14,
  fontWeight: 700,
}))

const BoxLine = styled(Box)(() => ({
  position: 'absolute',
  height: 4,
  background: '#0A7AFF',
  borderRadius: 2,
}))

const ScaleWrapper = styled(Box)(({ theme }) => ({
  paddingTop: theme.spacing(5),
  '@media (max-width: 809px)': {
    paddingTop: theme.spacing(2),
  },
}))

export default ChangeDrag
