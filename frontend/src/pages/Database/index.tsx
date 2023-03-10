import { Box, Button, IconButton, styled, TextField } from '@mui/material'
import { useState } from 'react'
import DatabaseTableComponent from 'components/DatabaseTable'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CloseIcon from '@mui/icons-material/Close'
import ImageView from 'components/ImageView'

const PopupSearch = ({ onClose }: { onClose: any }) => {
  const handleFilter = () => {
    onClose()
  }

  return (
    <Popup>
      <PopupInner>
        <HeaderTitle>
          <span>Filter</span>
          <ButtonControl onClick={onClose}>
            <CloseIcon />
          </ButtonControl>
        </HeaderTitle>
        <InputSearch name={'session'} label="Session" variant="outlined" />
        <InputSearch name={'dataset'} label="Dataset" variant="outlined" />
        <InputSearch name={'type'} label="Type" variant="outlined" />
        <InputSearch name={'protocol'} label="Protocol" variant="outlined" />
        <Button variant="contained" onClick={handleFilter}>
          Filter
        </Button>
      </PopupInner>
    </Popup>
  )
}

export type DataDatabase = {
  id: number
  lab_name: string
  user_name: string
  sample_name: string
  recording_time: string
  sessions: [
    {
      id: number
      parent_id: number
      label: string
      datatypes: [
        {
          id: number
          parent_id: number
          label: string
          images: [
            {
              id: number
              parent_id: number
              image_url: string
              attributes: {}
            },
          ]
        },
      ]
    },
  ]
}

export const defaultDatabase = [
  {
    id: 3,
    lab_name: 'string',
    user_name: 'string',
    sample_name: 'string',
    recording_time: '2023-03-10',
  },
  {
    id: 0,
    lab_name: 'string',
    user_name: 'string',
    sample_name: 'string',
    recording_time: '2023-03-10',
    sessions: [
      {
        id: 0,
        parent_id: 0,
        label: 'string',
        datatypes: [
          {
            id: 0,
            parent_id: 0,
            label: 'string',
            protocol: 'protocol',
            size: '8MB',
            voxel_size: 'voxel_size',
            images: [
              {
                id: 0,
                parent_id: 0,
                image_url: 'string',
                attributes: {},
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 1,
    lab_name: 'string 1',
    user_name: 'string 1',
    sample_name: 'string 1',
    recording_time: '2023-03-10',
    sessions: [
      {
        id: 1,
        parent_id: 0,
        label: 'string 1',
        datatypes: [
          {
            id: 1,
            parent_id: 0,
            label: 'string 1',
            protocol: 'protocol 1',
            size: '8MB',
            voxel_size: 'voxel_size 1',
            images: [
              {
                id: 1,
                parent_id: 0,
                image_url: 'string 1',
                attributes: {},
              },
            ],
          },
        ],
      },
    ],
  },
]

export const columns = [
  { title: 'Lab', name: 'lab_name' },
  { title: 'User', name: 'user_name' },
  { title: 'Date', name: 'recording_time' },
  { title: 'Session', name: 'sessions', child: 'label' },
  { title: 'Dataset', name: 'datatypes', child: 'label' },
  { title: 'Type', name: 'type', filter: true },
  { title: 'Protocol', name: 'protocol' },
  { title: 'Size', name: 'size' },
  { title: 'Voxel size', name: 'voxel_size' },
  {
    title: '',
    name: 'action',
    render: (data: any) =>
      data.control ? (
        <BoxButton>
          <ButtonControl aria-label="Example">
            <EditIcon fontSize="small" color={'inherit'} />
          </ButtonControl>
          <ButtonControl aria-label="Example">
            <DeleteIcon fontSize="small" sx={{ color: 'red' }} />
          </ButtonControl>
        </BoxButton>
      ) : null,
  },
]

const Database = () => {
  const [openPopup, setOpenPopup] = useState(false)
  const [openViewer, setOpenViewer] = useState(false)
  const [data /*setData*/] = useState(defaultDatabase)

  const onCloseImageView = () => {
    setOpenViewer(false)
  }

  const rowClick = (row: any) => {
    console.log('row', row)
    setOpenViewer(true)
  }

  return (
    <DatabaseWrapper>
      <ProjectsTitle>
        <span>Database</span>
        <ButtonFilter
          variant="contained"
          onClick={() => setOpenPopup(true)}
          style={{ margin: '0 26px 0 0' }}
        >
          Filter
        </ButtonFilter>
      </ProjectsTitle>
      {openPopup && <PopupSearch onClose={() => setOpenPopup(false)} />}
      <DatabaseTableComponent
        rowClick={rowClick}
        data={data}
        columns={columns}
        expands={['sessions', 'datatypes']}
      />
      <ImageView open={openViewer} onClose={onCloseImageView} />
    </DatabaseWrapper>
  )
}

const DatabaseWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(2),
}))

const HeaderTitle = styled('h1')(({ theme }) => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
}))

const Popup = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#cccccc80',
}))

const PopupInner = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  backgroundColor: '#fff',
  borderRadius: theme.spacing(1),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}))

const InputSearch = styled(TextField)(({ theme }) => ({
  minWidth: 250,
}))

const BoxButton = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: theme.spacing(1),
}))

const ButtonFilter = styled(Button)(({ theme }) => ({
  margin: theme.spacing(2, 0),
  minWidth: 80,
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
}))

const ButtonControl = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(0, 1),
  width: 40,
  height: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}))

const ProjectsTitle = styled('h1')(({ theme }) => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
}))

export default Database
