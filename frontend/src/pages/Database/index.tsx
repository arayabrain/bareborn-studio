import { Box, Button, IconButton, styled, TextField } from '@mui/material'
import { ChangeEvent, useEffect, useState } from 'react'
import DatabaseTableComponent from 'components/DatabaseTable'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CloseIcon from '@mui/icons-material/Close'
import ImageView from 'components/ImageView'
import ModalDeleteAccount from 'components/ModalDeleteAccount'
import { onGet, onRowClick, onSort } from 'utils/database'
import { User, useUser } from 'providers'

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

export type Image = {
  id: number
  parent_id: number
  session_id: number
  label: string
  image: {
    id: number
    parent_id: number
    image_url: string
    attributes: { [key: string]: any }
  }
}

export type Viewer = {
  open: boolean
  url: string
  jsonData?: { [key: string]: any }
  id?: number
  session_id?: number
  parent_id?: number
  image?: ImagesDatabase | RecordList
}

export type ImagesDatabase = {
  id: number
  parent_id: number
  image_url: string
  datatype_label?: string
  type?: string
  attributes: { [key: string]: any }
  session_id?: number
  record_index?: number
  subject_index?: number
  session_index?: number
  datatype_index?: number
  image_index?: number
}

export type DatatypesDatabase = {
  id: number
  parent_id: number
  label: string
  images: ImagesDatabase[]
}

export type SessionsDatabase = {
  id: number
  parent_id: number
  session_index?: number
  label: string
  datatypes: DatatypesDatabase[]
  subject_index?: number
}

export type SubjectDatabase = {
  id: number
  parent_id: number
  label: string
  sessions: SessionsDatabase[]
  subject_index?: number
}

export type RecordDatabase = {
  id: number
  lab_name: string
  user_name: string
  recording_time: string
  created_time: string
  updated_time: string
  subjects: SubjectDatabase[]
}

export type DatabaseData = {
  pagenation: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
  records: RecordDatabase[]
}

export type RecordList = {
  id: number
  lab_name: string
  user_name: string
  recording_time: string
  subject_id: number
  subject_label: string
  session_id: number
  session_label: string
  datatypes_id: number
  datatypes_label: string
  image_id: number
  image_url: string
  image_attributes: {
    size: string
    type: string
    protocol: string
  }
  created_time: string
  updated_time: string
}

export type DatabaseListData = {
  pagenation: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
  records: RecordList[]
}

export const defaultDatabase: DatabaseData = {
  pagenation: {
    page: 0,
    limit: 0,
    total: 0,
    total_pages: 0,
  },
  records: [
    {
      id: 0,
      lab_name: 'string',
      user_name: 'string',
      recording_time: '2023-04-07',
      subjects: [
        {
          id: 0,
          parent_id: 0,
          label: 'new subject',
          sessions: [
            {
              id: 0,
              parent_id: 0,
              label: 'new session',
              datatypes: [
                {
                  id: 0,
                  parent_id: 0,
                  label: 'anat',
                  images: [
                    {
                      id: 0,
                      parent_id: 0,
                      image_url: '/lib/test.nii',
                      attributes: {
                        size: '20MB',
                        type: 'TYPE_1',
                        protocol: 'Protocol',
                      },
                    },
                  ],
                },
                {
                  id: 1,
                  parent_id: 0,
                  label: 'func',
                  images: [
                    {
                      id: 1,
                      parent_id: 0,
                      image_url: '/lib/test0.nii',
                      attributes: {
                        size: '20MB',
                        type: 'TYPE_1',
                        protocol: 'Protocol',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 1,
          parent_id: 0,
          label: 'project subject',
          sessions: [
            {
              id: 1,
              parent_id: 1,
              label: 'zsession',
              datatypes: [
                {
                  id: 2,
                  parent_id: 1,
                  label: 'anat',
                  images: [
                    {
                      id: 2,
                      parent_id: 2,
                      image_url: '/lib/test1.nii',
                      attributes: {
                        size: '20MB',
                        type: 'TYPE_1',
                        protocol: 'Protocol',
                      },
                    },
                  ],
                },
                {
                  id: 3,
                  parent_id: 1,
                  label: 'zunc',
                  images: [
                    {
                      id: 3,
                      parent_id: 3,
                      image_url: '/lib/test2.nii',
                      attributes: {
                        size: '20MB',
                        type: 'T2_RATE',
                        protocol: 'X Protocol',
                      },
                    },
                    {
                      id: 4,
                      parent_id: 3,
                      image_url: '/lib/test3.nii',
                      attributes: {
                        size: '20MB',
                        type: 'TYPE_1',
                        protocol: 'Protocol',
                      },
                    },
                    {
                      id: 5,
                      parent_id: 3,
                      image_url: '/lib/test4.nii',
                      attributes: {
                        size: '20MB',
                        type: 'T3_RATE',
                        protocol: 'Z Protocol',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      created_time: '2023-04-07T04:28:09.686Z',
      updated_time: '2023-04-07T04:28:09.686Z',
    },
    {
      id: 1,
      lab_name: 'lab name',
      user_name: 'user name',
      recording_time: '2023-04-06',
      subjects: [
        {
          id: 3,
          parent_id: 1,
          label: 'subject name',
          sessions: [],
        },
        {
          id: 4,
          parent_id: 1,
          label: 'zubject name',
          sessions: [],
        },
        {
          id: 5,
          parent_id: 1,
          label: 'lubject name',
          sessions: [],
        },
      ],
      created_time: '2023-04-07T04:28:09.686Z',
      updated_time: '2023-04-07T04:28:09.686Z',
    },
  ],
}

const dataImages: DatabaseListData = {
  pagenation: {
    page: 0,
    limit: 0,
    total: 0,
    total_pages: 0,
  },
  records: [
    {
      id: 0,
      lab_name: 'lab name',
      user_name: 'string',
      recording_time: '2023-04-13',
      subject_id: 0,
      subject_label: 'string',
      session_id: 0,
      session_label: 'string',
      datatypes_id: 0,
      datatypes_label: 'string',
      image_id: 0,
      image_url: '/lib/test.nii',
      image_attributes: {
        size: '20MB',
        type: 'TYPE_1',
        protocol: 'Protocol',
      },
      created_time: '2023-04-13T04:48:01.063Z',
      updated_time: '2023-04-13T04:48:01.063Z',
    },
    {
      id: 1,
      lab_name: 'z lab name',
      user_name: 'string',
      recording_time: '2023-04-13',
      subject_id: 0,
      subject_label: 'string',
      session_id: 0,
      session_label: 'string',
      datatypes_id: 0,
      datatypes_label: 'string',
      image_id: 0,
      image_url: '/lib/test0.nii',
      image_attributes: {
        size: '20MB',
        type: 'TYPE_1',
        protocol: 'Protocol',
      },
      created_time: '2023-04-13T04:48:01.063Z',
      updated_time: '2023-04-13T04:48:01.063Z',
    },
    {
      id: 2,
      lab_name: 'x lab name',
      user_name: 'string',
      recording_time: '2023-04-13',
      subject_id: 0,
      subject_label: 'string',
      session_id: 0,
      session_label: 'string',
      datatypes_id: 0,
      datatypes_label: 'string',
      image_id: 0,
      image_url: '/lib/test1.nii',
      image_attributes: {
        size: '20MB',
        type: 'TYPE_1',
        protocol: 'Protocol',
      },
      created_time: '2023-04-13T04:48:01.063Z',
      updated_time: '2023-04-13T04:48:01.063Z',
    },
    {
      id: 3,
      lab_name: 'c lab name',
      user_name: 'string',
      recording_time: '2023-04-13',
      subject_id: 0,
      subject_label: 'string',
      session_id: 0,
      session_label: 'string',
      datatypes_id: 0,
      datatypes_label: 'string',
      image_id: 0,
      image_url: '/lib/test2.nii',
      image_attributes: {
        size: '20MB',
        type: 'TYPE_1',
        protocol: 'Protocol',
      },
      created_time: '2023-04-13T04:48:01.063Z',
      updated_time: '2023-04-13T04:48:01.063Z',
    },
    {
      id: 4,
      lab_name: '4 lab name',
      user_name: 'string',
      recording_time: '2023-04-13',
      subject_id: 0,
      subject_label: 'string',
      session_id: 0,
      session_label: 'string',
      datatypes_id: 0,
      datatypes_label: 'string',
      image_id: 0,
      image_url: '/lib/test3.nii',
      image_attributes: {
        size: '20MB',
        type: 'TYPE_1',
        protocol: 'Z Protocol',
      },
      created_time: '2023-04-13T04:48:01.063Z',
      updated_time: '2023-04-13T04:48:01.063Z',
    },
    {
      id: 5,
      lab_name: 'string',
      user_name: 'string',
      recording_time: '2023-04-13',
      subject_id: 0,
      subject_label: 'string',
      session_id: 0,
      session_label: 'string',
      datatypes_id: 0,
      datatypes_label: 'string',
      image_id: 0,
      image_url: '/lib/test4.nii',
      image_attributes: {
        size: '20MB',
        type: 'TYPE_1',
        protocol: 'X Protocol',
      },
      created_time: '2023-04-13T04:48:01.063Z',
      updated_time: '2023-04-13T04:48:01.063Z',
    },
  ],
}

export const columns = (
  rowClick: Function,
  setOpenDelete: Function,
  type: 'tree' | 'list' = 'tree',
  user?: User,
) => [
  { title: 'Lab', name: 'lab_name', filter: true, width: 100 },
  { title: 'User', name: 'user_name', filter: true },
  { title: 'Date', name: 'recording_time', filter: true },
  {
    title: 'Subject',
    name: type === 'tree' ? 'subject' : 'subject_label',
    filter: true,
  },
  {
    title: 'Session',
    name: type === 'tree' ? 'session' : 'session_label',
    child: 'label',
    filter: true,
    width: 100,
  },
  {
    title: 'Dataset',
    name: type === 'tree' ? 'datatype' : 'datatypes_label',
    filter: true,
    width: 100,
  },
  {
    title: 'Type',
    name: type === 'tree' ? 'attributes.type' : 'image_attributes.type',
    filter: true,
  },
  {
    title: 'Protocol',
    name: type === 'tree' ? 'attributes.protocol' : 'image_attributes.protocol',
    filter: true,
  },
  {
    title: 'Size',
    name: type === 'tree' ? 'attributes.size' : 'image_attributes.size',
    filter: true,
  },
  {
    title: 'Voxel size',
    name:
      type === 'tree' ? 'attributes.voxel_size' : 'image_attributes.voxel_size',
    filter: true,
  },
  {
    title: '',
    name: 'action',
    render: (data: RecordDatabase) => {
      if (user?.role !== 'ADMIN') return null
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
  const [viewer, setViewer] = useState<Viewer>({ open: false, url: '' })
  const [datasTable, setDatasTable] = useState<DatabaseData | DatabaseListData>(
    defaultDatabase,
  )
  const [initDataTable, setInitDataTable] = useState<
    DatabaseData | DatabaseListData
  >(defaultDatabase)
  const [openDelete, setOpenDelete] = useState(false)
  const [orderBy, setOrdeBy] = useState<'ASC' | 'DESC' | ''>('')
  const [columnSort, setColumnSort] = useState<string>('')
  const [type, setType] = useState<'tree' | 'list'>('tree')
  const [disabled, setDisabled] = useState({ left: false, right: false })
  const { user } = useUser()

  const onCloseImageView = () => {
    setViewer({ open: false, url: '' })
  }

  useEffect(() => {
    if (type === 'tree') {
      setDatasTable(defaultDatabase)
      setInitDataTable(defaultDatabase)
    } else {
      setDatasTable(dataImages)
      setInitDataTable(dataImages)
    }
  }, [type])

  const rowClick = (row: ImagesDatabase | RecordList) => {
    const { view, checkNext, checkPre } = onRowClick(datasTable, row, type)
    setViewer(view)
    setDisabled({ left: !checkPre, right: !checkNext })
  }

  const handleCloseDelete = () => {
    setOpenDelete(false)
  }

  const onDelete = () => {
    setOpenDelete(false)
  }

  const handleSort = (orderKey: string, orderByValue: 'DESC' | 'ASC') => {
    let orderbyCheck: 'DESC' | 'ASC' | '' = orderByValue
    if (orderBy === 'DESC' && orderByValue === 'ASC') {
      orderbyCheck = ''
    }
    const data = onSort(
      JSON.parse(JSON.stringify(initDataTable.records)),
      orderbyCheck,
      orderKey,
      type,
    )
    setDatasTable({ ...datasTable, records: data as any })
    setColumnSort(orderKey)
    setOrdeBy(orderbyCheck)
  }

  const onNext = () => {
    if (!viewer.image) return
    const imageNext = onGet(datasTable as any, viewer.image, false, type)
    if (imageNext) rowClick(imageNext)
  }

  const onPrevious = () => {
    if (!viewer.image) return
    const imagePre = onGet(datasTable, viewer.image, true, type)
    if (imagePre) rowClick(imagePre)
  }

  return (
    <DatabaseWrapper>
      <ModalDeleteAccount
        titleSubmit="Delete Image"
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
        defaultExpand
        onSort={handleSort}
        rowClick={rowClick}
        orderKey={columnSort}
        orderBy={orderBy}
        data={datasTable.records}
        columns={columns(rowClick, setOpenDelete, type, user)}
      />
      <ImageView
        disabled={disabled}
        url={viewer.url}
        open={viewer.open}
        jsonData={viewer.jsonData}
        onClose={onCloseImageView}
        onNext={onNext}
        onPrevious={onPrevious}
      />
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
