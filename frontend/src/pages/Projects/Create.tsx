import {
  Box,
  Button,
  FormControlLabel,
  Radio,
  RadioGroup,
  styled,
  SxProps,
  Theme,
} from '@mui/material'
import DatabaseTableComponent from 'components/DatabaseTable'
import React, { useState, DragEvent, useRef } from 'react'
import { getNanoId } from 'utils/nanoid/NanoIdUtils'
import { defaultDatabase, PopupSearch } from '../Database'

const columns = [
  { title: 'User', name: 'user_name' },
  { title: 'Date', name: 'recording_time' },
  { title: 'Session', name: 'sessions', child: 'label' },
  { title: 'Dataset', name: 'datatypes', child: 'label' },
  { title: 'Type', name: 'type', filter: true },
  { title: 'Protocol', name: 'protocol' },
]

type BoxDrop = {
  data?: any
  level: string
  onDrop?: (event: DragEvent<HTMLDivElement | HTMLButtonElement>) => any
  onDragLeave?: (event: any) => any
  onDragOver?: (event: any) => any
  onClick?: () => any
  renderItems?: () => any
  style?: SxProps<Theme>
}

type ProjectAdd = {
  project_name: string
  project_type: number
  image_count: number
  protocol: string
  id: string
}

type RowDrag = {
  label: string
  protocol: string
  images: any[]
}

const RenderBetweenComponent = ({
  data,
  level,
  onDrop,
  onClick,
  onDragLeave,
  onDragOver,
  style,
  renderItems,
}: BoxDrop) => {
  const [betweenData, setBetweenData] = useState(
    data || {
      name: 'Between Factor Name 1',
    },
  )

  const onChangeName = (e: any) => {
    setBetweenData({ ...betweenData, name: e.target.value })
  }
  return (
    <BetweenComponent>
      <InputName value={betweenData.name} onChange={onChangeName} />
      <BetweenContent>
        <RenderBoxDrop
          renderItems={renderItems}
          style={style}
          onClick={onClick}
          onDrop={onDrop}
          level={level}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
        />
      </BetweenContent>
    </BetweenComponent>
  )
}
const RenderBoxDrop = ({
  data,
  level,
  onDrop,
  onClick,
  onDragLeave,
  onDragOver,
  style,
  renderItems,
}: BoxDrop) => {
  const [withinData, setWithinData] = useState(
    data || {
      name: 'Within Factor Name 1',
    },
  )

  const onChangeName = (e: any) => {
    setWithinData({ ...withinData, name: e.target.value })
  }

  return (
    <BetweenComponent>
      {level === 'factor' ? null : (
        <InputName value={withinData.name} onChange={onChangeName} />
      )}
      {level === 'factor' ? null : (
        <>
          <Box style={{ marginTop: 8 }}>{renderItems?.()}</Box>
          <NewRowButton
            onClick={onClick}
            onDrop={onDrop}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            sx={style}
          >
            + Add Within Factor
          </NewRowButton>
        </>
      )}
    </BetweenComponent>
  )
}

const ProjectFormComponent = () => {
  const [projectName, setProjectName] = useState('Prj Name 1')
  const [projectLevel, setProjectLevel] = useState('factor')
  const [showBorderDrag, setShowBorderDrag] = useState(false)
  const [openFilter, setOpenFilter] = useState(false)
  const [projectAdds, setProjectAdds] = useState<ProjectAdd[]>([])
  const [rowDrag, setRowDrag] = useState<RowDrag | undefined>()

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const onChangeName = (e: any) => {
    setProjectName(e.target.value)
  }

  const handleChangeLevel = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProjectLevel((event.target as HTMLInputElement).value)
  }

  const onDragRow = (row: any) => {
    setRowDrag(row)
  }

  const onDragEnd = (row: any) => {
    setRowDrag(undefined)
  }

  const onDropData = (type: number) => {
    if (!rowDrag) return
    setProjectAdds([
      ...projectAdds,
      {
        id: getNanoId(),
        project_name: rowDrag.label,
        image_count: rowDrag.images?.length || 0,
        project_type: type,
        protocol: rowDrag.protocol,
      },
    ])
  }

  const onDragOver = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }

  const onDragLeave = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }

  const onClickDrag = () => {
    setShowBorderDrag(true)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setShowBorderDrag(false)
      timeoutRef.current = null
    }, 1000)
  }

  const onDelete = (row: ProjectAdd) => {
    const newProjectAdds = projectAdds.filter((e) => e.id !== row.id)
    setProjectAdds(newProjectAdds)
  }

  const renderData = (type: number) => {
    const dataBetween = projectAdds.filter((e) => e.project_type === type)
    return dataBetween.map((e, index) => (
      <BoxItem key={index}>
        <TypographyBoxItem>{e.project_name}</TypographyBoxItem>
        <TypographyBoxItem>
          {e.project_type ? 'TYPE_RATE' : 'TYPE_1'}
        </TypographyBoxItem>
        <TypographyBoxItem>{e.protocol}</TypographyBoxItem>
        <Box
          style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}
        >
          <Button onClick={() => onDelete(e)}>Delete</Button>
        </Box>
      </BoxItem>
    ))
  }

  return (
    <ProjectsWrapper>
      {openFilter && <PopupSearch onClose={() => setOpenFilter(false)} />}
      <InputName value={projectName} onChange={onChangeName} />
      <BoxOptions
        aria-labelledby="demo-radio-buttons-group-label"
        value={projectLevel}
        name="radio-buttons-group"
        onChange={handleChangeLevel}
      >
        <FormControlLabel
          value="factor"
          control={<Radio />}
          label="Between factor"
        />
        <FormControlLabel
          value="within-factor"
          control={<Radio />}
          label="Between factor-within factor"
        />
      </BoxOptions>
      <DropAndDropBox>
        <DragBox>
          <RenderBetweenComponent
            onClick={onClickDrag}
            onDrop={() => onDropData(1)}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            style={{ borderColor: rowDrag ? 'red' : '' }}
            level={projectLevel}
            renderItems={() => (
              <Box style={{ paddingLeft: 36 }}>{renderData(1)}</Box>
            )}
          />
          <Box style={{ paddingLeft: 36 }}>{renderData(0)}</Box>
          <NewRowButton
            onClick={onClickDrag}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={() => onDropData(0)}
            style={{ borderColor: rowDrag ? 'red' : '' }}
          >
            + Add Between Factor
          </NewRowButton>
        </DragBox>
        <DropBox>
          <BoxFilter>
            <ButtonFilter
              variant="contained"
              onClick={() => setOpenFilter(true)}
              style={{ margin: '0 26px 0 0' }}
            >
              Filter
            </ButtonFilter>
          </BoxFilter>
          <DatabaseTableComponent
            showBorderDrag={showBorderDrag}
            defaultExpand
            onDrag={onDragRow}
            onDragEnd={onDragEnd}
            draggable
            data={defaultDatabase}
            columns={columns}
            expands={['sessions', 'datatypes']}
          />
        </DropBox>
      </DropAndDropBox>
    </ProjectsWrapper>
  )
}

const BoxItem = styled(Box)({
  display: 'flex',
  height: 40,
  alignItems: 'center',
  border: '1px solid rgba(0,0,0,0.8)',
  padding: '0 16px',
  marginBottom: 4,
})

const TypographyBoxItem = styled(Box)({
  minWidth: 120,
})

const ProjectsWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(2),
}))

const BoxOptions = styled(RadioGroup)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(1, 2),
}))

const InputName = styled('input')(({ theme }) => ({
  padding: theme.spacing(1),
  outline: 'none',
  borderColor: 'transparent',
  fontSize: 18,
  width: 'calc(100% - 32px)',
  '&:focus': {
    borderColor: '#000',
  },
  display: 'block',
  borderWidth: 1,
}))

const DropAndDropBox = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  gap: theme.spacing(2),
}))

const DragBox = styled(Box)(({ theme }) => ({
  width: '40%',
  padding: theme.spacing(1, 2),
  border: '1px solid #000',
  minHeight: 100,
}))

const DropBox = styled(Box)(({ theme }) => ({
  width: '60%',
  padding: theme.spacing(1, 2),
  border: '1px solid #dedede',
}))

const BetweenComponent = styled(Box)(({ theme }) => ({
  width: '100%',
  input: {
    borderBottom: '1px solid #dedede',
  },
}))

const BetweenContent = styled(Box)(({ theme }) => ({
  width: '100%',
  paddingLeft: theme.spacing(2),
}))

const NewRowButton = styled(Button)(({ theme }) => ({
  width: '60%',
  padding: theme.spacing(1, 2),
  borderStyle: 'dashed',
  borderWidth: 1,
  margin: theme.spacing(1, 0),
}))

const ButtonFilter = styled(Button)(({ theme }) => ({
  margin: theme.spacing(2, 0),
  minWidth: 80,
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
}))

const BoxFilter = styled(Box)({
  display: 'flex',
  marginBottom: 10,
  justifyContent: 'flex-end',
})

export default ProjectFormComponent
