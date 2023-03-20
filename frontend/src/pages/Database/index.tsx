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
  subjects: string
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

const dataImages = [
  {
    id: 3,
    lab_name: 'lab 1',
    user_name: 'hoge',
    sample_name: 'hoge',
    recording_time: '2023-03-10',
    type: 'TYPE_RATE',
    protocol: 'protocol 3',
    size: '8MB',
    voxel_size: '8MB',
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
  {
    id: 4,
    lab_name: 'lab 2',
    user_name: 'hoge 2',
    sample_name: 'hoge 2',
    recording_time: '2023-03-10',
    type: 'TYPE_2',
    protocol: 'protocol 3',
    size: '8MB',
    voxel_size: '8MB',
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
]

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
    subjects: 'subjects 1',
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
        sessions: 'session 1',
        subjects: 'subjects 3',
        datatypes: {
          title: 'anat',
          images: [
            {
              id: 0,
              parent_id: 0,
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
            {
              id: 2,
              parent_id: 2,
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
      },
      {
        id: 0,
        parent_id: 0,
        sessions: 'session 3',
        subjects: 'subjects 3',
        datatypes: {
          title: 'anat',
          images: [
            {
              id: 0,
              parent_id: 0,
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
            {
              id: 2,
              parent_id: 2,
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
            {
              id: 3,
              parent_id: 4,
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
      },
    ],
  },
]

export const columns = (rowClick: Function, setOpenDelete: Function) => [
  { title: 'Lab', name: 'lab_name', filter: true, width: 100 },
  { title: 'User', name: 'user_name', filter: true },
  { title: 'Date', name: 'recording_time', filter: true },
  { title: 'Subjects', name: 'subjects', filter: true },
  {
    title: 'Session',
    name: 'sessions',
    child: 'label',
    filter: true,
    width: 100,
  },
  {
    title: 'Dataset',
    name: 'datatypes',
    filter: true,
    width: 100,
  },
  { title: 'Type', name: 'type', filter: true },
  { title: 'Protocol', name: 'protocol', filter: true },
  { title: 'Size', name: 'size', filter: true },
  { title: 'Voxel size', name: 'voxel_size', filter: true },
  {
    title: '',
    name: 'action',
    render: (data: any) => {
      if (!Array.isArray(data?.images) || !data?.images?.length) return null
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
  // const [data /*setData*/] = useState(defaultDatabase)
  const [openDelete, setOpenDelete] = useState(false)
  const [orderBy, setOrdeBy] = useState<'ASC' | 'DESC' | undefined>()
  const [columnSort, setColumnSort] = useState<string>('')
  const [type, setType] = useState<'tree' | 'list'>('tree')

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

  const onSort = (orderKey: string) => {
    setColumnSort(orderKey)
    if (!orderBy || orderKey !== columnSort) {
      setOrdeBy('ASC')
    } else if (orderBy === 'ASC') {
      setOrdeBy('DESC')
    } else {
      setOrdeBy(undefined)
    }
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
      <BoxSelectTypeView>
        <Box
          onClick={() => setType('tree')}
          style={{
            marginRight: 4,
            fontWeight: type === 'tree' ? 700 : 500,
            cursor: 'pointer',
            color: type === 'tree' ? '' : '#4687f4',
          }}
        >
          Tree
        </Box>
        /
        <Box
          onClick={() => setType('list')}
          style={{
            marginLeft: 4,
            fontWeight: type === 'list' ? 700 : 500,
            cursor: 'pointer',
            color: type === 'list' ? '' : '#4687f4',
          }}
        >
          List
        </Box>
      </BoxSelectTypeView>
      {openPopup && <PopupSearch onClose={() => setOpenPopup(false)} />}
      <DatabaseTableComponent
        previewImage={type === 'list'}
        onSort={onSort}
        rowClick={rowClick}
        orderKey={columnSort}
        orderBy={orderBy}
        data={type === 'tree' ? defaultDatabase : dataImages}
        columns={columns(rowClick, setOpenDelete)}
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
  color: '#ffffff',
}))

const ButtonControl = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(0, 1),
  width: 30,
  height: 30,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}))

const ProjectsTitle = styled('h1')(() => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
}))

const BoxSelectTypeView = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  marginBottom: 16,
})

export default Database
