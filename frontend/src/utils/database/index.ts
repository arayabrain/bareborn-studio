import {
  DatabaseData,
  DatabaseListData,
  DatatypesDatabase,
  ImagesDatabase,
  RecordDatabase,
  RecordList,
  SessionsDatabase,
  SubjectDatabase,
} from 'pages/Database'
import { getRawdb } from 'api/rawdb'

export type OrderKey =
  | keyof (RecordDatabase | RecordList)
  | 'subject'
  | 'session'
  | 'datatype'
  | 'image_attributes.image_type'
  | 'image_attributes.protocol'
  | 'image_attributes.scale'
  | 'image_attributes.voxel'

export const onRowClick = async (
  datas: DatabaseData | DatabaseListData,
  row: ImagesDatabase | RecordList,
  type: 'tree' | 'list' = 'tree',
) => {
  const data = await getRawdb(row.id)
  const view = {
    open: true,
    url: row.image_url,
    id: row.id,
    session_id: (row as ImagesDatabase).session_id,
    parent_id: (row as ImagesDatabase).parent_id,
    jsonData: data,
    image: row,
  }
  const checkNext = onGet(datas, row, false, type)
  const checkPre = onGet(datas, row, true, type)
  return { view, checkNext, checkPre }
}

export const onGet = (
  datas: DatabaseData | DatabaseListData,
  rowClick: ImagesDatabase | RecordList,
  isSub?: boolean,
  type: 'tree' | 'list' = 'tree',
): ImagesDatabase | RecordList | undefined => {
  if (type === 'tree') {
    const row = rowClick as ImagesDatabase
    const dataNow = datas.records[row.record_index || 0] as RecordDatabase
    const subjectNow = dataNow?.subjects?.[row.subject_index || 0]
    const sessionNow = subjectNow?.sessions[row.session_index || 0]
    const datatypeNow = sessionNow?.datatypes[row.datatype_index || 0]
    if (!isSub) {
      const imageNext = datatypeNow?.images[(row.image_index || 0) + 1]
      if (imageNext) {
        return { ...row, ...imageNext, image_index: (row.image_index || 0) + 1 }
      }
      const datatypeNext = sessionNow?.datatypes[(row.datatype_index || 0) + 1]
      if (datatypeNext) {
        const images = datatypeNext?.images
        if (images[0])
          return {
            ...row,
            ...images[0],
            datatype_index: (row.datatype_index || 0) + 1,
            image_index: 0,
          }
      }
    } else {
      const imagePre = datatypeNow?.images[(row.image_index || 0) - 1]
      if (imagePre) {
        return { ...row, ...imagePre, image_index: (row.image_index || 0) - 1 }
      }
      const datatypeImagePre =
        sessionNow?.datatypes?.[(row.datatype_index || 0) - 1]
      if (datatypeImagePre) {
        const images = datatypeImagePre?.images
        if (images?.[images.length - 1]) {
          return {
            ...row,
            ...images?.[images.length - 1],
            datatype_index: (row.datatype_index || 0) - 1,
            image_index: images.length - 1,
          }
        }
      }
    }
  } else {
    const row = rowClick as RecordList
    const indexImageNow = datas.records.findIndex(
      (record) => record.id === row.id,
    )
    return datas.records[indexImageNow + (isSub ? -2 : 2)] as RecordList
  }
  return undefined
}

const sortWithLabName = (
  datasTable: (RecordDatabase | RecordList)[],
  orderKey: keyof (RecordDatabase | RecordList),
  typeOrder?: 'ASC' | 'DESC',
) => {
  const newDatas = datasTable.sort(
    (a: RecordDatabase | RecordList, b: RecordDatabase | RecordList) => {
      if (typeOrder === 'DESC') {
        return a[orderKey] > b[orderKey] ? -1 : 1
      }
      return a[orderKey] < b[orderKey] ? -1 : 1
    },
  )
  return newDatas
}

const sortSubjectTree = (
  datasTable: RecordDatabase[],
  typeOrder?: 'ASC' | 'DESC',
) => {
  return datasTable.map((element) => ({
    ...element,
    subjects: element.subjects.sort((subA, subB) => {
      if (typeOrder === 'DESC') {
        return subA.label > subB.label ? -1 : 1
      }
      return subA.label < subB.label ? -1 : 1
    }),
  }))
}

const sortSessionTree = (
  datasTable: RecordDatabase[],
  typeOrder?: 'ASC' | 'DESC',
) => {
  const newDatas = datasTable.map((element) => ({
    ...element,
    subjects: element.subjects.map((sub) => ({
      ...sub,
      sessions: sub.sessions.sort((ssA, ssB) => {
        if (typeOrder === 'DESC') {
          return ssA.label > ssB.label ? -1 : 1
        }
        return ssA.label < ssB.label ? -1 : 1
      }),
    })),
  }))
  return newDatas
}

const sortDataTypeTree = (
  datasTable: RecordDatabase[],
  typeOrder?: 'ASC' | 'DESC',
) => {
  const newDatas = datasTable.map((element) => ({
    ...element,
    subjects: element.subjects.map((sub) => ({
      ...sub,
      sessions: sub.sessions.map((ssA) => ({
        ...ssA,
        datatypes: ssA.datatypes.sort((typeA, typeB) => {
          if (typeOrder === 'DESC') {
            return typeA.label > typeB.label ? -1 : 1
          }
          return typeA.label < typeB.label ? -1 : 1
        }),
      })),
    })),
  }))
  return newDatas
}

const sortAttributesTypeTree = (
  datasTable: RecordDatabase[],
  typeOrder?: 'ASC' | 'DESC',
  key: string = 'type',
) => {
  const newDatas = datasTable.map((element) => ({
    ...element,
    subjects: element.subjects.map((sub) => ({
      ...sub,
      sessions: sub.sessions.map((ssA) => ({
        ...ssA,
        datatypes: ssA.datatypes.map((type) => ({
          ...type,
          images: type.images.sort((sA, sB) => {
            if (typeOrder === 'DESC') {
              return sA.image_attributes[key]?.toString?.() >
                sB.image_attributes[key]?.toString?.()
                ? -1
                : 1
            }
            return sA.image_attributes[key]?.toString?.() <
              sB.image_attributes[key]?.toString?.()
              ? -1
              : 1
          }),
        })),
      })),
    })),
  }))
  return newDatas
}

const sortWithKey = (
  datasTable: RecordList[],
  orderKey: keyof RecordList,
  typeOrder?: 'ASC' | 'DESC',
) => {
  return datasTable.sort((dataA: RecordList, dataB: RecordList) => {
    let valueA: RecordList | string = dataA
    if (orderKey.includes('.')) {
      const keys = orderKey.split('.')
      keys.forEach((k) => {
        if (typeof valueA !== 'string') {
          valueA = valueA?.[k as keyof RecordList] as string
        }
      })
    } else valueA = valueA[orderKey] as string

    let valueB: RecordList | string = dataB
    if (orderKey.includes('.')) {
      const keys = orderKey.split('.')
      keys.forEach((k) => {
        if (typeof valueB !== 'string') {
          valueB = valueB?.[k as keyof RecordList] as string
        }
      })
    } else valueB = valueB[orderKey] as string
    if (typeOrder === 'DESC') {
      return valueA > valueB ? -1 : 1
    }
    return valueA < valueB ? -1 : 1
  })
}

const sortWithTime = (
  datasTable: (RecordDatabase | RecordList)[],
  typeOrder: 'ASC' | 'DESC',
) => {
  const newDatas = datasTable.sort(
    (a: RecordDatabase | RecordList, b: RecordDatabase | RecordList) => {
      if (typeOrder === 'DESC') {
        return new Date(a.recording_time) > new Date(b.recording_time) ? -1 : 1
      }
      return new Date(a.recording_time) < new Date(b.recording_time) ? -1 : 1
    },
  )
  return newDatas
}

export const onSort = (
  datasTable: (RecordDatabase | RecordList)[],
  typeOrder: 'ASC' | 'DESC' | '',
  orderKey: OrderKey,
  type: string = 'tree',
): (RecordDatabase | RecordList)[] => {
  if (!typeOrder) return datasTable
  let newDatas = datasTable
  if (type === 'tree') {
    if (['lab_name', 'user_name'].includes(orderKey)) {
      newDatas = sortWithLabName(
        datasTable,
        orderKey as 'lab_name' | 'user_name',
        typeOrder,
      )
    } else if (orderKey === 'recording_time') {
      newDatas = sortWithTime(datasTable, typeOrder)
    } else if (orderKey === 'subject' && type === 'tree') {
      newDatas = sortSubjectTree(datasTable as RecordDatabase[], typeOrder)
    } else if (orderKey === 'session' && type === 'tree') {
      newDatas = sortSessionTree(datasTable as RecordDatabase[], typeOrder)
    } else if (orderKey === 'datatype' && type === 'tree') {
      newDatas = sortDataTypeTree(datasTable as RecordDatabase[], typeOrder)
    } else if (orderKey === 'image_attributes.image_type' && type === 'tree') {
      newDatas = sortAttributesTypeTree(
        datasTable as RecordDatabase[],
        typeOrder,
      )
    } else if (orderKey === 'image_attributes.protocol' && type === 'tree') {
      newDatas = sortAttributesTypeTree(
        datasTable as RecordDatabase[],
        typeOrder,
        'protocol',
      )
    } else if (orderKey === 'image_attributes.voxel' && type === 'tree') {
      newDatas = sortAttributesTypeTree(
        datasTable as RecordDatabase[],
        typeOrder,
        'voxel',
      )
    } else if (orderKey === 'image_attributes.scale' && type === 'tree') {
      newDatas = sortAttributesTypeTree(
        datasTable as RecordDatabase[],
        typeOrder,
        'scale',
      )
    }
  } else {
    newDatas = sortWithKey(
      datasTable as RecordList[],
      orderKey as keyof RecordList,
      typeOrder,
    )
  }
  return newDatas
}

export const onFilterValue = (
  value: { [key: string]: string },
  setDatabases: (value: any) => void,
  initDataTable: DatabaseData,
  type: 'tree' | 'list',
) => {
  if (!Object.keys(value).some((key) => value[key])) {
    setDatabases(initDataTable)
    return
  }
  if (type === 'list') {
    const arrFilter = initDataTable.records.filter((item: any) => {
      return !Object.keys(value).some((key: string) => {
        if (!value[key]) return false
        if (key === 'protocol') {
          return !item.image_attributes[key]
            ?.toLowerCase()
            .includes(value[key].toLowerCase?.())
        }
        return !item[key]?.includes(value[key].toLowerCase?.())
      })
    })
    setDatabases({
      pagenation: {
        page: 0,
        limit: 0,
        total: 0,
        total_pages: 0,
      },
      records: arrFilter,
    })
    return
  }
  const newRecords = initDataTable.records.reduce(
    (arrRecord: RecordDatabase[], record) => {
      const subjects = record.subjects.reduce(
        (arrSub: SubjectDatabase[], subject) => {
          const sessions = subject.sessions.reduce(
            (arrSess: SessionsDatabase[], session) => {
              if (
                session.label
                  ?.toLowerCase()
                  ?.includes((value.session_label || '')?.toLowerCase())
              ) {
                const datatypes = session.datatypes.reduce(
                  (arrDt: DatatypesDatabase[], dt) => {
                    if (
                      dt.label
                        ?.toLowerCase()
                        ?.includes((value.datatypes_label || '')?.toLowerCase())
                    ) {
                      const images = dt.images.filter((image) => {
                        const { image_type, protocol } = image.image_attributes
                        return (
                          (image_type as string)
                            ?.toLowerCase()
                            .includes((value.type || '').toLowerCase()) &&
                          (protocol as string)
                            ?.toLowerCase()
                            .includes((value.protocol || '').toLowerCase())
                        )
                      })
                      if (images.length) {
                        arrDt.push({ ...dt, images })
                      }
                    }
                    return arrDt
                  },
                  [],
                )
                if (datatypes.length) {
                  arrSess.push({ ...session, datatypes })
                }
              }
              return arrSess
            },
            [],
          )
          if (sessions.length) {
            arrSub.push({ ...subject, sessions })
          }
          return arrSub
        },
        [],
      )
      if (subjects.length) {
        arrRecord.push({ ...record, subjects })
      }
      return arrRecord
    },
    [],
  )
  setDatabases({
    pagenation: {
      page: 0,
      limit: 0,
      total: 0,
      total_pages: 0,
    },
    records: newRecords,
  })
  return
}
