import { Box, Button, styled } from '@mui/material'
import { useCallback, useMemo, useState } from 'react'
import TableComponent, { Column } from '../../components/Table'
import { useNavigate } from 'react-router-dom'
import ModalDeleteAccount from 'components/ModalDeleteAccount'
import { useUser } from "../../providers";
import { isReseacher } from "../../utils/auth";

export type DataProject = {
  id: number | string
  uid?: number | string
  name: string
  project_type: number
  image_count: number
  created_time: string
  updated_time: string
  role?: string | number
}

const Projects = () => {
  const { user } = useUser()
  const navigate = useNavigate()
  const [idDelete, setIdDelete] = useState<number | string | undefined>()
  const [data, setData] = useState<DataProject[]>([
    {
      id: '1',
      name: 'prj name 1',
      created_time: '2023-03-10 09:19',
      updated_time: '2023-03-10 09:19',
      image_count: 3,
      project_type: 0,
    },
    {
      id: '2',
      name: 'prj name 2',
      created_time: '2023-03-10 09:19',
      updated_time: '2023-03-10 09:19',
      image_count: 3,
      project_type: 1,
    },
  ])

  const onEdit = useCallback((id: number | string) => {
    navigate(`/projects/new-project?id=${id}`)
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onWorkflow = useCallback((id: number | string) => {
    console.log('Workflow: ', id)
    navigate(`/projects/workflow?tab=0&id=${id}`)
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onResults = useCallback((id: number | string) => {
    console.log('Result: ', id)
    navigate(`/projects/workflow?tab=1&id=${id}`)
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addNewProject = useCallback(() => {
    navigate('/projects/new-project')
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onDelete = (id: number | string) => {
    setIdDelete(id)
  }

  const onDeleteSubmit = () => {
    const id = idDelete
    setIdDelete(undefined)
    setData(data.filter((e) => e.id !== id))
  }

  const handleCloseDelete = () => {
    setIdDelete(undefined)
  }

  const columns = useMemo(
    (): Column[] => [
      { title: 'Project Name', name: 'name' },
      { title: 'Created', name: 'created_time' },
      { title: 'Updated', name: 'updated_time' },
      { title: 'Images', name: 'image_count', align: 'center' },
      {
        title: '',
        name: 'action',
        width: 400,
        render: (data) => {
          return (
            <BoxAction>
              <ButtonAdd variant="contained" onClick={() => onEdit(data.id)}>
                Edit
              </ButtonAdd>
              <ButtonAdd
                variant="contained"
                onClick={() => onWorkflow(data.id)}
              >
                Workflow
              </ButtonAdd>
              <ButtonAdd variant="contained" onClick={() => onResults(data.id)}>
                Result
              </ButtonAdd>
              {
                !isReseacher(user?.role) &&
                  <ButtonAdd
                      variant="contained"
                      onClick={() => onDelete(data.id)}
                      sx={{ backgroundColor: 'red !important' }}
                  >
                      Del
                  </ButtonAdd>
              }
            </BoxAction>
          )
        },
      },
    ],
    [onWorkflow, onResults, onEdit, user],
  )
  return (
    <ProjectsWrapper>
      <ModalDeleteAccount
        titleSubmit="Delete Project"
        description="Delete My Project"
        onClose={handleCloseDelete}
        open={!!idDelete}
        onSubmit={onDeleteSubmit}
      />
      <ProjectsTitle>Projects</ProjectsTitle>
      <BoxButton>
        <ButtonAdd
          variant="contained"
          onClick={addNewProject}
          sx={{ marginBottom: 2 }}
        >
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

const BoxAction = styled(BoxButton)({
  justifyContent: 'flex-start',
})

const ButtonAdd = styled(Button)(({ theme }) => ({
  minWidth: 80,
  letterSpacing: 'unset',
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  backgroundColor: '#283237 !important',
  color: '#ffffff',
}))

export default Projects
