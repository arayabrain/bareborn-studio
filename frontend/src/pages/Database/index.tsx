import { Box, Button, IconButton, styled, TextField } from '@mui/material'
import { useMemo, useState } from 'react'
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

export const defaultDatabase = [
  {
    id: '1',
    lab_name: 'lab1',
    user_name: 'hope',
    date: '2023/02/24',
  },
  {
    id: '2',
    lab_name: '',
    user_name: '',
    date: '',
    session_name: 'sess 1',
    dataset: [
      {
        id: '9',
        dataset_title: 'anat',
        dataset: [
          {
            id: '3',
            lab_name: '',
            user_name: '',
            date: '',
            session_name: '',
            dataset: {},
            type: 'T2_RARE',
            protocol: 'aaaaaaaa',
            size: '1234',
            voxel_size: '1234',
            control: true,
          },
          {
            id: '4',
            lab_name: '',
            user_name: '',
            date: '',
            session_name: '',
            dataset: {},
            type: 'T2_RARE',
            protocol: 'aaaaaaaa',
            size: '1234',
            voxel_size: '1234',
            control: true,
          },
        ],
      },
      {
        id: '10',
        dataset_title: 'anat 2',
        dataset: [
          {
            id: '7',
            lab_name: '',
            user_name: '',
            date: '',
            session_name: '',
            dataset: {},
            type: 'T2_RARE',
            protocol: 'aaaaaaaa',
            size: '1234',
            voxel_size: '1234',
            control: true,
          },
        ],
      },
    ],
  },
  {
    id: '5',
    lab_name: '',
    user_name: '',
    date: '',
    session_name: 'sess 2',
    dataset: null,
  },
]

const Database = () => {
  const [openPopup, setOpenPopup] = useState(false)
  const [openViewer, setOpenViewer] = useState(false)
  const [data /*setData*/] = useState([
    {
      id: '1',
      lab_name: 'lab1',
      user_name: 'hope',
      date: '2023/02/24',
    },
    {
      id: '2',
      lab_name: '',
      user_name: '',
      date: '',
      session_name: 'sess 1',
      dataset: [
        {
          id: '9',
          dataset_title: 'anat',
          dataset: [
            {
              id: '3',
              lab_name: '',
              user_name: '',
              date: '',
              session_name: '',
              dataset: {},
              type: 'T2_RARE',
              protocol: 'aaaaaaaa',
              size: '1234',
              voxel_size: '1234',
              control: true,
            },
            {
              id: '4',
              lab_name: '',
              user_name: '',
              date: '',
              session_name: '',
              dataset: {},
              type: 'T2_RARE',
              protocol: 'aaaaaaaa',
              size: '1234',
              voxel_size: '1234',
              control: true,
            },
          ],
        },
        {
          id: '10',
          dataset_title: 'anat 2',
          dataset: [
            {
              id: '7',
              lab_name: '',
              user_name: '',
              date: '',
              session_name: '',
              dataset: {},
              type: 'T2_RARE',
              protocol: 'aaaaaaaa',
              size: '1234',
              voxel_size: '1234',
              control: true,
            },
          ],
        },
      ],
    },
    {
      id: '5',
      lab_name: '',
      user_name: '',
      date: '',
      session_name: 'sess 2',
      dataset: null,
    },
  ])

  const columns = useMemo(
    () => [
      { title: 'Lab', name: 'lab_name' },
      { title: 'User', name: 'user_name' },
      { title: 'Date', name: 'date' },
      { title: 'Session', name: 'session_name' },
      { title: 'Dataset', name: 'dataset_title' },
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
                <EditIcon color={'inherit'} />
              </ButtonControl>
              <ButtonControl aria-label="Example">
                <DeleteIcon sx={{ color: 'red' }} />
              </ButtonControl>
            </BoxButton>
          ) : null,
      },
    ],
    [],
  )

  const onCloseImageView = () => {
    setOpenViewer(false)
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
      <DatabaseTableComponent data={data} columns={columns} />
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
}))

const ProjectsTitle = styled('h1')(({ theme }) => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
}))

export default Database
