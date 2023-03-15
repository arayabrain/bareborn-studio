import { Box, Button, styled } from '@mui/material'
import { useCallback, useMemo, useState } from 'react'
import TableComponent from '../../components/Table'
import { useNavigate } from 'react-router-dom'

type DataProject = {
  id: number | string
  project_name: string
  project_type: number
  image_count: number
  created_time: string
  updated_time: string
}

const Projects = () => {
  const navigate = useNavigate()
  const [data /*setData*/] = useState<DataProject[]>([
    {
      id: '1',
      project_name: 'prj name 1',
      created_time: '2023-03-10T09:19:38.080Z',
      updated_time: '2023-03-10T09:19:38.080Z',
      image_count: 3,
      project_type: 0,
    },
    {
      id: '2',
      project_name: 'prj name 2',
      created_time: '2023-03-10T09:19:38.080Z',
      updated_time: '2023-03-10T09:19:38.080Z',
      image_count: 3,
      project_type: 1,
    },
  ])

  const onEdit = useCallback((id: any) => {
    console.log('edit: ', id)
  }, [])

  const onWorkflow = useCallback((id: any) => {
    console.log('Workflow: ', id)
    navigate('/workflow')
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onResults = useCallback((id: any) => {
    console.log('Results: ', id)
    navigate('/workflow?tab=2')
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addNewProject = useCallback(() => {
    navigate('/project/new-project')
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const columns = useMemo(
    () => [
      { title: 'Project Name', name: 'name' },
      { title: 'Created', name: 'created_time' },
      { title: 'Updated', name: 'updated_time' },
      { title: 'Images', name: 'image_count', align: 'center' },
      {
        title: '',
        name: 'action',
        width: 185,
        render: (data: any) => (
          <BoxButton>
            <ButtonAdd variant="contained" onClick={() => onEdit(data.id)}>
              Edit
            </ButtonAdd>
            <ButtonAdd variant="contained" onClick={() => onWorkflow(data.id)}>
              Workflow
            </ButtonAdd>
            <ButtonAdd variant="contained" onClick={() => onResults(data.id)}>
              Results
            </ButtonAdd>
          </BoxButton>
        ),
      },
    ],
    [onWorkflow, onResults, onEdit],
  )
  return (
    <ProjectsWrapper>
      <ProjectsTitle>Projects</ProjectsTitle>
      <BoxButton>
        <ButtonAdd variant="contained" onClick={addNewProject}>
          Add Project
        </ButtonAdd>
      </BoxButton>
      <TableComponent
        paginate={{ total: 100, page: 1, page_size: 10 }}
        data={data}
        columns={columns}
      />
    </ProjectsWrapper>
  )
}

const ProjectsWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(2),
}))

const ProjectsTitle = styled('h1')(({ theme }) => ({}))

const BoxButton = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: theme.spacing(1),
}))

const ButtonAdd = styled(Button)(({ theme }) => ({
  margin: theme.spacing(2, 0),
  minWidth: 80,
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
}))

export default Projects
