import {Box, Button, FormControlLabel, Radio, RadioGroup, styled} from "@mui/material";
import DatabaseTableComponent from "components/DatabaseTable";
import React, {useMemo, useState} from "react";
import {defaultDatabase} from "../Database";

const RenderBetweenComponent = ({data, level}: {data?: any, level: string}) => {
  const [betweenData, setBetweenData] = useState(data || {
    name: 'Between Factor Name 1'
  })
  
  const onChangeName = (e: any) => {
    setBetweenData({...betweenData, name: e.target.value})
  }
  return (
    <BetweenComponent>
      <InputName value={betweenData.name} onChange={onChangeName}/>
      <BetweenContent>
        <RenderBoxDrop level={level}/>
      </BetweenContent>
    </BetweenComponent>
  )
}
const RenderBoxDrop = ({data, level}: {data?: any, level?: string}) => {
  const [withinData, setWithinData] = useState(data || {
    name: 'Within Factor Name 1'
  })
  
  const onChangeName = (e: any) => {
    withinData({...withinData, name: e.target.value})
  }
  
  return (
    <BetweenComponent>
      { level === 'factor' ? null : <InputName value={withinData.name} onChange={onChangeName}/>}
      <DropBoxContent>
      
      </DropBoxContent>
      { level === 'factor' ? null : <NewRowButton>+ Add Within Factor</NewRowButton>}
    </BetweenComponent>
  )
}


const ProjectFormComponent = () => {
  const [projectName, setProjectName] = useState('Prj Name 1')
  const [projectLevel, setProjectLevel] = useState('factor')
  const [project, setProject] = useState([
  
  ])
  const columns = useMemo(
    () => [
      { title: 'User', name: 'user_name' },
      { title: 'Date', name: 'date' },
      { title: 'Session', name: 'session_name'},
      { title: 'Dataset', name: 'dataset_title'},
      { title: 'Type', name: 'type'},
      { title: 'Protocol', name: 'protocol'},
      {
        title: '',
        name: 'action',
      },
    ],
    [],
  )
  const onChangeName = (e: any) => {
    setProjectName(e.target.value)
  }
  
  const handleChangeLevel = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProjectLevel((event.target as HTMLInputElement).value)
  };
  
  return (
    <ProjectsWrapper>
      <InputName value={projectName} onChange={onChangeName} />
      <BoxOptions
        aria-labelledby="demo-radio-buttons-group-label"
        value={projectLevel}
        name="radio-buttons-group"
        onChange={handleChangeLevel}
      >
          <FormControlLabel value="factor" control={<Radio/>} label="Between factor" />
          <FormControlLabel value="within-factor" control={<Radio />} label="Between factor-within factor" />
      </BoxOptions>
      <DropAndDropBox>
        <DragBox>
          <RenderBetweenComponent level={projectLevel} />
          <NewRowButton>+ Add Between Factor</NewRowButton>
        </DragBox>
        <DropBox>
          <DatabaseTableComponent
            data={defaultDatabase}
            columns={columns}
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
    borderColor: '#000'
  },
  display: 'block',
  borderWidth: 1
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
  minHeight: 100
}))

const DropBox = styled(Box)(({ theme }) => ({
  width: '60%',
  padding: theme.spacing(1, 2),
}))

const BetweenComponent = styled(Box)(({ theme }) => ({
  width: '100%',
  input: {
    borderBottom: '1px solid #dedede'
  }
}))

const BetweenContent = styled(Box)(({ theme }) => ({
  width: '100%',
  paddingLeft: theme.spacing(2)
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
  margin: theme.spacing(1, 0)
}))

export default ProjectFormComponent
