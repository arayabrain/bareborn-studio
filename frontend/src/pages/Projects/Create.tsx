import {
  Box,
  Button,
  FormControlLabel,
  Radio,
  RadioGroup,
  styled,
} from '@mui/material'
import DatabaseTableComponent from 'components/DatabaseTable'
import React, { useState, DragEvent, useRef } from 'react'
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
  onClick?: () => any
}

const RenderBetweenComponent = ({ data, level, onDrop, onClick }: BoxDrop) => {
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
        <RenderBoxDrop onClick={onClick} onDrop={onDrop} level={level} />
      </BetweenContent>
    </BetweenComponent>
  )
}
const RenderBoxDrop = ({ data, level, onDrop, onClick }: BoxDrop) => {
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
      <DropBoxContent></DropBoxContent>
      {level === 'factor' ? null : (
        <NewRowButton onClick={onClick} onDrop={onDrop}>
          + Add Within Factor
        </NewRowButton>
      )}
    </BetweenComponent>
  )
}

const ProjectFormComponent = () => {
  const [projectName, setProjectName] = useState('Prj Name 1')
  const [projectLevel, setProjectLevel] = useState('factor')
  const [showBorderDrag, setShowBorderDrag] = useState(false)
  const [openFilter, setOpenFilter] = useState(false)

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const onChangeName = (e: any) => {
    setProjectName(e.target.value)
  }

  const handleChangeLevel = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProjectLevel((event.target as HTMLInputElement).value)
  }

  const onDragRow = (row: any) => {
    console.log('row', row)
  }

  const onDragEnd = (row: any) => {
    console.log('row end', row)
  }

  const onDropData = () => {
    console.log('onDropData')
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
            onDrop={onDropData}
            level={projectLevel}
          />
          <NewRowButton
            onClick={onClickDrag}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDropData}
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

const DropBoxContent = styled(Box)(({ theme }) => ({
  width: '100%',
  paddingLeft: theme.spacing(2),
  minHeight: 40,
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
