import {
  Box,
  Button,
  FormControlLabel,
  Input,
  Radio,
  RadioGroup,
  styled,
  Typography,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import DatabaseTableComponent from 'components/DatabaseTable'
import React, {
  useState,
  DragEvent,
  Fragment,
  useRef,
  CSSProperties,
} from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getNanoId } from 'utils/nanoid/NanoIdUtils'
import {
  DatabaseData,
  defaultDatabase,
  ImagesDatabase,
  PopupSearch,
  Viewer,
} from '../Database'
import ImageView from 'components/ImageView'
import { onGet, onRowClick, onSort, OrderKey } from 'utils/database'
import { Object } from '../Database'
import { ChangeEvent } from 'react'
import { RecordDatabase } from '../Database'
// import { setInputNodeFilePath } from 'store/slice/InputNode/InputNodeActions'
// import { useDispatch } from 'react-redux'

const columns = [
  { title: 'User', name: 'user_name', filter: true },
  { title: 'Date', name: 'recording_time', filter: true, width: 100 },
  { title: 'Subject', name: 'subject', filter: true },
  {
    title: 'Session',
    name: 'session',
    child: 'label',
    filter: true,
    width: 100,
  },
  {
    title: 'Datatype',
    name: 'datatype',
    filter: true,
    width: 100,
  },
  { title: 'Size', name: 'attributes.size', filter: true },
  { title: 'Voxel size', name: 'attributes.voxel_size', filter: true },
]

type ProjectAdd = {
  project_name?: string
  project_type?: string
  image_count: number
  image_url: string
  protocol: string
  id: string
  image_id: number
  jsonData: Object
}

type DataWithin = {
  id: string
  data: ProjectAdd[]
  name: string
}

type DataFactor = {
  within: DataWithin[]
} & DataWithin

const nameDefault = 'DEFAULT'

const ProjectFormComponent = () => {
  const [searchParams] = useSearchParams()

  const idEdit = searchParams.get('id')
  const [viewer, setViewer] = useState<Viewer>({ open: false, url: '' })
  const [orderBy, setOrdeBy] = useState<'ASC' | 'DESC' | ''>('')
  const [columnSort, setColumnSort] = useState<string>('')
  const [datasTable, setDatasTable] = useState<DatabaseData>(defaultDatabase)
  const [imageIDs, setImageIDs] = useState<number[]>([])
  const routeGoback = searchParams.get('back')
  // const nodeId = searchParams.get('nodeId')
  const isPendingDrag = useRef(false)
  // const dispatch = useDispatch()

  const [initDataTable /*setInitDataTable */] =
    useState<DatabaseData>(defaultDatabase)
  const [projectName, setProjectName] = useState('Prj Name 1')
  const [projectLevel, setProjectLevel] = useState<'factor' | 'within-factor'>(
    'factor',
  )
  const [disabled, setDisabled] = useState({ left: false, right: false })
  const [openFilter, setOpenFilter] = useState(false)
  const [rowDrag, setRowDrag] = useState<ImagesDatabase | ImagesDatabase[]>()
  const [dataFactors, setDataFactors] = useState<DataFactor[]>([
    { name: nameDefault, within: [], id: getNanoId(), data: [] },
  ])
  const timeoutClick = useRef<NodeJS.Timeout | undefined>()
  const navigate = useNavigate()
  const [isEditName, setIsEditName] = useState(false)

  const onChangeName = (e: ChangeEvent<HTMLInputElement>) => {
    setProjectName(e.target.value)
  }

  const handleChangeLevel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const type = event.target.value as 'within-factor' | 'factor'
    setProjectLevel(type)
    let within: DataWithin[] = []
    if (type === 'within-factor') {
      within = [{ name: nameDefault, id: getNanoId(), data: [] }]
    }
    setImageIDs([])
    setDataFactors([{ name: nameDefault, within, id: getNanoId(), data: [] }])
  }

  const onAddBetween = () => {
    setDataFactors((pre) => [
      ...pre,
      { name: nameDefault, within: [], id: getNanoId(), data: [] },
    ])
  }

  const onAddWithin = (idFactor: string) => {
    setDataFactors((pre) =>
      pre.map((p) => {
        if (p.id === idFactor) {
          return {
            ...p,
            within: [
              ...p.within,
              { name: nameDefault, within: [], id: getNanoId(), data: [] },
            ],
          }
        }
        return p
      }),
    )
  }

  const onDeleteFactor = (row: DataFactor) => {
    setImageIDs((pre) =>
      pre.filter((id) => !row.data.find((rowData) => rowData.image_id === id)),
    )
    setDataFactors((pre) => pre.filter((e) => e.id !== row.id))
  }

  const onDeleteWithin = (factor: DataFactor, row: DataWithin) => {
    setImageIDs((pre) =>
      pre.filter((id) => !row.data.find((rowData) => rowData.image_id === id)),
    )
    setDataFactors((pre) =>
      pre.map((p) => {
        if (p.id === factor.id) {
          return { ...p, within: p.within.filter((w) => w.id !== row.id) }
        }
        return p
      }),
    )
  }

  const onDeleteDataWithin = (
    factor: DataFactor,
    within: DataWithin,
    row: ProjectAdd,
  ) => {
    setImageIDs((pre) => pre.filter((id) => id !== row.image_id))
    setDataFactors((pre) =>
      pre.map((p) => {
        if (p.id === factor.id) {
          return {
            ...p,
            within: p.within.map((w) => {
              if (w.id === within.id) {
                return { ...w, data: w.data.filter((d) => d.id !== row.id) }
              }
              return w
            }),
          }
        }
        return p
      }),
    )
  }

  const onDeleteDataFactor = (factor: DataFactor, row: ProjectAdd) => {
    setImageIDs((pre) => pre.filter((id) => id !== row.image_id))
    setDataFactors((pre) =>
      pre.map((p) => {
        if (p.id === factor.id) {
          return { ...p, data: p.data.filter((d) => d.id !== row.id) }
        }
        return p
      }),
    )
  }

  const onDragRow = (row: ImagesDatabase[] = []) => {
    setRowDrag(row)
  }

  const onBeginDrag = () => {
    isPendingDrag.current = true
    const mouseup = () => {
      isPendingDrag.current = false
      window.removeEventListener('mouseup', mouseup)
    }
    window.addEventListener('mouseup', mouseup)
  }

  const onDragEnd = () => {
    setRowDrag(undefined)
  }

  const onMouseOver = (factor: DataFactor, within?: DataWithin) => {
    if (isPendingDrag.current) return
    onDropData(factor, within)
    setRowDrag(undefined)
  }

  const onDropData = (factor: DataFactor, within?: DataWithin) => {
    if (!Array.isArray(rowDrag) && !rowDrag?.image_url) {
      return
    }
    let newData: ProjectAdd[] = []
    const checkExistIdImage =
      imageIDs.length &&
      imageIDs.some((id) => {
        if (!Array.isArray(rowDrag)) return rowDrag.id === id
        return rowDrag.some((row) => row.id === id)
      })
    if (checkExistIdImage) {
      return alert('Image existed')
    }
    const newIds = Array.isArray(rowDrag)
      ? rowDrag.map((row) => row.id)
      : [rowDrag.id]
    setImageIDs([...imageIDs, ...newIds])
    if (!Array.isArray(rowDrag)) {
      newData = [
        {
          id: getNanoId(),
          project_name: rowDrag.datatype_label,
          image_count: 1,
          image_id: rowDrag.id,
          project_type: rowDrag.attributes.type as string,
          protocol: rowDrag.attributes.protocol as string,
          image_url: rowDrag?.image_url,
          jsonData: rowDrag?.attributes,
        },
      ]
    } else if (Array.isArray(rowDrag)) {
      newData = rowDrag.map((row) => ({
        id: getNanoId(),
        project_name: row.datatype_label,
        image_count: 1,
        image_id: row.id,
        project_type: row.attributes.type as string,
        protocol: row.attributes.protocol as string,
        image_url: row?.image_url,
        jsonData: row?.attributes,
      }))
    }
    if (projectLevel !== 'within-factor') {
      setDataFactors((pre) =>
        pre.map((p) => {
          if (p.id === factor.id) {
            return { ...p, data: [...p.data, ...newData] }
          }
          return p
        }),
      )
      return
    }
    if (within) {
      setDataFactors((pre) =>
        pre.map((p) => {
          if (p.id === factor.id) {
            return {
              ...p,
              within: p.within.map((w) => {
                if (w.id === within.id) {
                  return { ...w, data: [...w.data, ...newData] }
                }
                return w
              }),
            }
          }
          return p
        }),
      )
    }
  }

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const onDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const onChangeNameFactor = (factor: DataFactor, value: string) => {
    setDataFactors((pre) =>
      pre.map((p) => {
        if (p.id === factor.id) {
          return { ...p, name: value }
        }
        return p
      }),
    )
  }

  const onChangeNameWithinFactor = (
    factor: DataFactor,
    within: DataWithin,
    value: string,
  ) => {
    setDataFactors((pre) =>
      pre.map((p) => {
        if (p.id === factor.id) {
          return {
            ...p,
            within: p.within.map((w) => {
              if (w.id === within.id) {
                return { ...w, name: value }
              }
              return w
            }),
          }
        }
        return p
      }),
    )
  }

  const renderData = (
    data: ProjectAdd[],
    style?: CSSProperties,
    onDelete?: (row: ProjectAdd) => void,
  ) => {
    return data.map((e, index) => (
      <BoxItem
        key={`${e.id}_${index}`}
        style={style}
        onClick={() => rowDataClick(e)}
      >
        <TypographyBoxItem>{e.project_name}</TypographyBoxItem>
        <TypographyBoxItem>{e.project_type}</TypographyBoxItem>
        <TypographyBoxItem>{e.protocol}</TypographyBoxItem>
        <Box
          style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}
        >
          <Button
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              onDelete?.(e)
            }}
          >
            <DeleteIcon fontSize="small" sx={{ color: 'red' }} />
          </Button>
        </Box>
      </BoxItem>
    ))
  }

  const onCloseImageView = () => {
    setViewer({ open: false, url: '' })
  }

  const rowClick = (row: ImagesDatabase) => {
    const { view, checkNext, checkPre } = onRowClick(datasTable, row)
    setViewer(view)
    setDisabled({ left: !checkPre, right: !checkNext })
  }

  const rowDataClick = (row: ProjectAdd) => {
    if (!row?.image_url || !timeoutClick.current) {
      timeoutClick.current = setTimeout(() => {
        timeoutClick.current = undefined
      }, 300)
      return
    }
    setViewer({
      open: true,
      url: row.image_url,
      jsonData: row.jsonData,
    })
    setDisabled({ left: true, right: true })
  }

  const handleSort = (orderKey: string, orderByValue: 'DESC' | 'ASC' | '') => {
    const data = onSort(
      JSON.parse(JSON.stringify(initDataTable.records)),
      orderByValue,
      orderKey as OrderKey,
    )
    setDatasTable({ ...datasTable, records: data as RecordDatabase[] })
    setColumnSort(orderKey)
    setOrdeBy(orderByValue)
  }

  const onNext = () => {
    if (!viewer.image) return
    const imageNext = onGet(datasTable, viewer.image, false)
    if (imageNext) rowClick(imageNext as ImagesDatabase)
  }

  const onPrevious = () => {
    if (!viewer.image) return
    const imagePre = onGet(datasTable, viewer.image, true)
    if (imagePre) rowClick(imagePre as ImagesDatabase)
  }

  const onOk = () => {
    navigate(!routeGoback ? '/projects' : `${routeGoback}&id=${idEdit}`)
  }

  // const onChangeFilePath = (path: string[]) => {
  //   if (!nodeId) return
  //   dispatch(setInputNodeFilePath({ nodeId, filePath: path }))
  // }

  return (
    <ProjectsWrapper>
      {openFilter && <PopupSearch onClose={() => setOpenFilter(false)} />}
      <ImageView
        disabled={disabled}
        url={viewer.url}
        open={viewer.open}
        jsonData={viewer.jsonData}
        onClose={onCloseImageView}
        onNext={onNext}
        onPrevious={onPrevious}
      />
      {isEditName ? (
        <InputName
          autoFocus
          onBlur={() => setIsEditName(false)}
          value={projectName}
          onChange={onChangeName}
        />
      ) : (
        <TextName onClick={() => setIsEditName(true)}>{projectName}</TextName>
      )}
      <BoxOptions
        aria-labelledby="demo-radio-buttons-group-label"
        value={projectLevel}
        name="radio-buttons-group"
        onChange={handleChangeLevel}
      >
        <Box>
          <Box>
            <FormControlLabel
              value="factor"
              control={<Radio />}
              label="Between factor"
            />
          </Box>
          <FormControlLabel
            value="within-factor"
            control={<Radio />}
            label="Between factor-within factor"
          />
        </Box>
      </BoxOptions>
      <DropAndDropBox>
        <DragBox>
          {dataFactors.map((factor, index) => {
            return (
              <Fragment key={factor.id}>
                <BoxFactor>
                  <Input
                    onChange={(e) => onChangeNameFactor(factor, e.target.value)}
                    style={{ width: 'calc(100% - 64px)' }}
                    value={
                      factor.name === nameDefault
                        ? `Between factor name ${index}`
                        : factor.name
                    }
                  />
                  <Button onClick={() => onDeleteFactor(factor)}>
                    <DeleteIcon fontSize="small" sx={{ color: 'red' }} />
                  </Button>
                  {projectLevel === 'within-factor' ? (
                    factor.within.map((within, indexWithin) => (
                      <BoxFactor key={within.id} style={{ marginLeft: 24 }}>
                        <Input
                          onChange={(e) =>
                            onChangeNameWithinFactor(
                              factor,
                              within,
                              e.target.value,
                            )
                          }
                          style={{ width: 'calc(100% - 64px)' }}
                          value={
                            within.name === nameDefault
                              ? `Within factor name ${indexWithin}`
                              : within.name
                          }
                        />
                        <Button onClick={() => onDeleteWithin(factor, within)}>
                          <DeleteIcon fontSize="small" sx={{ color: 'red' }} />
                        </Button>
                        {renderData(within.data, { marginLeft: 48 }, (row) => {
                          onDeleteDataWithin(factor, within, row)
                        })}
                        <BoxDrag
                          style={{
                            borderBottom: rowDrag ? '1px dashed red' : '',
                          }}
                          onDrop={() => onDropData(factor, within)}
                          onMouseOver={() => onMouseOver(factor, within)}
                          onDragOver={onDragOver}
                          onDragLeave={onDragLeave}
                        />
                      </BoxFactor>
                    ))
                  ) : (
                    <>
                      {renderData(factor.data, { marginLeft: 24 }, (row) => {
                        onDeleteDataFactor(factor, row)
                      })}
                      <BoxDrag
                        style={{
                          borderBottom:
                            (Array.isArray(rowDrag) && rowDrag.length) ||
                            (!Array.isArray(rowDrag) && !!rowDrag)
                              ? '1px dashed red'
                              : '',
                        }}
                        onDrop={() => onDropData(factor)}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onMouseOver={() => onMouseOver(factor)}
                      />
                    </>
                  )}
                </BoxFactor>
                {projectLevel === 'within-factor' && dataFactors.length ? (
                  <NewRowButton
                    onClick={() => onAddWithin(factor.id)}
                    style={{ marginLeft: 24 }}
                  >
                    + Add Within Factor
                  </NewRowButton>
                ) : null}
              </Fragment>
            )
          })}
          <NewRowButton onClick={onAddBetween}>
            + Add Between Factor
          </NewRowButton>
        </DragBox>
        <DropBox>
          <BoxFilter>
            <ButtonFilter
              onClick={() => setOpenFilter(true)}
              style={{ margin: '0 26px 0 0' }}
            >
              Filter
            </ButtonFilter>
          </BoxFilter>
          <DatabaseTableComponent
            onSort={handleSort}
            orderKey={columnSort}
            orderBy={orderBy}
            rowClick={rowClick}
            defaultExpand
            onBeginDrag={onBeginDrag}
            onDrag={onDragRow}
            onDragEnd={onDragEnd}
            draggable
            data={datasTable.records}
            columns={columns}
          />
        </DropBox>
      </DropAndDropBox>
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        <ButtonFilter
          onClick={() =>
            navigate(!routeGoback ? '/projects' : `${routeGoback}&id=${idEdit}`)
          }
        >
          {idEdit ? 'Ok' : 'Add'}
        </ButtonFilter>
        <ButtonFilter onClick={onOk}>Cancel</ButtonFilter>
      </Box>
    </ProjectsWrapper>
  )
}

const TextName = styled(Typography)(({ theme }) => ({
  textOverflow: 'ellipsis',
  width: 'calc(40% - 16px)',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  padding: theme.spacing(1),
  borderWidth: 1,
  fontSize: 16,
}))

const BoxItem = styled(Box)({
  display: 'flex',
  height: 40,
  alignItems: 'center',
  borderBottom: '1px solid rgba(0,0,0,0.8)',
  paddingLeft: 16,
  marginBottom: 4,
})

const TypographyBoxItem = styled(Box)({
  minWidth: 120,
})

const BoxDrag = styled(Box)({
  paddingBottom: 24,
  width: '100%',
  borderWidth: 1,
})

const BoxFactor = styled(Box)({})

const ProjectsWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
}))

const BoxOptions = styled(RadioGroup)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(1, 2),
  display: 'flex',
  flexDirection: 'inherit',
}))

const InputName = styled('input')(({ theme }) => ({
  padding: theme.spacing(1),
  outline: 'none',
  borderColor: 'transparent',
  fontSize: 18,
  width: 'calc(40% - 16px)',
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
  height: 'calc(100% - 177px)',
  overflow: 'hidden',
}))

const DragBox = styled(Box)(({ theme }) => ({
  width: '40%',
  padding: theme.spacing(1, 2),
  border: '1px solid #000',
  minHeight: 100,
  height: 'calc(100% - 18px)',
  overflow: 'auto',
}))

const DropBox = styled(Box)(({ theme }) => ({
  width: '60%',
  padding: theme.spacing(1, 2),
  border: '1px solid #dedede',
  height: 'calc(100% - 18px)',
  overflow: 'auto',
}))

const NewRowButton = styled(Button)(({ theme }) => ({
  width: '60%',
  padding: theme.spacing(1, 2),
  borderStyle: 'dashed',
  borderWidth: 1,
  margin: theme.spacing(1, 0),
}))

const ButtonFilter = styled(Button)(({ theme }) => ({
  margin: theme.spacing(2, 1),
  minWidth: 80,
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  color: '#ffffff',
  backgroundColor: '#283237 !important',
}))

const BoxFilter = styled(Box)({
  display: 'flex',
  marginBottom: 10,
  justifyContent: 'flex-end',
})

export default ProjectFormComponent
