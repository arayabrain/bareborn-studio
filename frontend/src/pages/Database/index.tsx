import { Box, Button, IconButton, styled, TextField } from '@mui/material'
import { ChangeEvent, useState } from 'react'
import DatabaseTableComponent from 'components/DatabaseTable'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CloseIcon from '@mui/icons-material/Close'
import ImageView from 'components/ImageView'
import ModalDeleteAccount from 'components/ModalDeleteAccount'

type PopupSearchProps = {
  onClose?: () => any
  onFilter?: (values: { [key: string]: string }) => any
  defaultValue?: { [key: string]: string }
}

export const PopupSearch = ({
  onClose,
  defaultValue = {},
  onFilter,
}: PopupSearchProps) => {
  const [values, setValues] = useState(defaultValue)

  const handleFilter = () => {
    onFilter?.(values)
    onClose?.()
  }

  const onChange = (
    event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    setValues({ ...values, [event.target.name]: event.target.value })
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
        <InputSearch
          onChange={onChange}
          name={'session'}
          label="Session"
          variant="outlined"
        />
        <InputSearch
          onChange={onChange}
          name={'dataset'}
          label="Dataset"
          variant="outlined"
        />
        <InputSearch
          onChange={onChange}
          name={'type'}
          label="Type"
          variant="outlined"
        />
        <InputSearch
          onChange={onChange}
          name={'protocol'}
          label="Protocol"
          variant="outlined"
        />
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
    lab_name: 'lab 1',
    user_name: 'hoge',
    sample_name: 'hoge',
    recording_time: '2023-03-10',
  },
  {
    id: 4,
    lab_name: 'lab 4',
    user_name: 'hoge 4',
    sample_name: 'hoge 4',
    recording_time: '2023-03-10',
  },
  {
    id: 5,
    lab_name: 'lab 5',
    user_name: 'hoge 5',
    sample_name: 'hoge 5',
    recording_time: '2023-03-10',
  },
  {
    id: 0,
    lab_name: 'lab 2',
    user_name: 'hoge 2',
    sample_name: 'hoge 2',
    recording_time: '2023-03-10',
    sessions: [
      {
        id: 0,
        parent_id: 0,
        label: 'session 1',
        datatypes: [
          {
            id: 0,
            parent_id: 0,
            label: 'anat',
            protocol: 'protocol',
            size: '8MB',
            voxel_size: 'voxel_size',
            type: 'TYPE_RATE',
            images: [
              {
                id: 0,
                parent_id: 0,
                image_url: 'lib/functional.nii',
                attributes: {},
              },
              {
                id: 1,
                parent_id: 0,
                image_url: 'lib/test.nii',
                attributes: {},
              },
            ],
          },
        ],
      },
      {
        id: 0,
        parent_id: 0,
        label: 'session 3',
        datatypes: [
          {
            id: 0,
            parent_id: 0,
            label: 'anat3',
            protocol: 'protocol 3',
            size: '8MB',
            voxel_size: '8MB',
            type: 'TYPE_RATE',
            images: [
              {
                id: 3,
                parent_id: 0,
                image_url: 'lib/functional.nii',
                attributes: {},
              },
              {
                id: 6,
                parent_id: 0,
                image_url: 'lib/test.nii',
                attributes: {},
              },
            ],
          },
        ],
      },
    ],
  },
]

export const columns = (rowClick: Function, setOpenDelete: Function) => [
  { title: 'Lab', name: 'lab_name' },
  { title: 'User', name: 'user_name' },
  { title: 'Date', name: 'recording_time' },
  { title: 'Session', name: 'sessions', child: 'label' },
  { title: 'Dataset', name: 'datatypes', child: 'label' },
  {
    title: 'Type',
    name: 'type',
    filter: true,
    render: (_: any, value: string) => value,
  },
  { title: 'Protocol', name: 'protocol' },
  { title: 'Size', name: 'size' },
  { title: 'Voxel size', name: 'voxel_size' },
  {
    title: '',
    name: 'action',
    render: (data: any) => {
      if (!data?.images?.length) return null
      return (
        <BoxButton>
          <ButtonControl
            aria-label="Example"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              rowClick?.(data)
            }}
          >
            <EditIcon fontSize="small" color={'inherit'} />
          </ButtonControl>
          <ButtonControl
            aria-label="Example"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              setOpenDelete?.(true)
            }}
          >
            <DeleteIcon fontSize="small" sx={{ color: 'red' }} />
          </ButtonControl>
        </BoxButton>
      )
    },
  },
]

const Database = () => {
  const [openPopup, setOpenPopup] = useState(false)
  const [viewer, setViewer] = useState({ open: false, urls: [] })
  const [data /*setData*/] = useState(defaultDatabase)
  const [openDelete, setOpenDelete] = useState(false)

  const onCloseImageView = () => {
    setViewer({ open: false, urls: [] })
  }

  const rowClick = (row: any) => {
    if (!row?.images?.length) return
    setViewer({
      open: true,
      urls: row.images.map((e: { image_url: string }) => e.image_url),
    })
  }

  const handleCloseDelete = () => {
    setOpenDelete(false)
  }

  const onDelete = () => {
    setOpenDelete(false)
  }

  return (
    <DatabaseWrapper>
      <ModalDeleteAccount
        titleSubmit="Delete Project"
        description={`Are you sure delete?\n`}
        onClose={handleCloseDelete}
        open={openDelete}
        onSubmit={onDelete}
      />
      <ProjectsTitle>
        <span>Database</span>
        <ButtonFilter
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
        columns={columns(rowClick, setOpenDelete)}
        expands={['sessions', 'datatypes']}
      />
      <ImageView {...viewer} onClose={onCloseImageView} />
    </DatabaseWrapper>
  )
}

const DatabaseWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(2),
  overflow: 'auto',
}))

const HeaderTitle = styled('h1')(() => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
}))

const Popup = styled(Box)(() => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#cccccc80',
  zIndex: 9999,
}))

const PopupInner = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  backgroundColor: '#fff',
  borderRadius: theme.spacing(1),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}))

const InputSearch = styled(TextField)(() => ({
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
  backgroundColor: '#283237 !important',
  color: '#ffffff'
}))

const ButtonControl = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(0, 1),
  width: 40,
  height: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}))

const ProjectsTitle = styled('h1')(() => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
}))

export default Database
