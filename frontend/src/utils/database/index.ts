import {
  DatabaseData,
  DatabaseListData,
  ImagesDatabase,
  RecordDatabase,
  RecordList,
} from 'pages/Database'
import { getRawdb } from "../../api/rawdb";

export type OrderKey =
  | keyof (RecordDatabase | RecordList)
  | 'subject'
  | 'session'
  | 'datatype'
  | 'image_attributes.image_type'
  | 'image_attributes.protocol'
  | 'image_attributes.scale'

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
  const newDatas = datasTable.sort((dataA, dataB) => {
    const subjectsA = dataA.subjects.sort((subA, subB) => {
      if (typeOrder === 'DESC') {
        return subA.label > subB.label ? -1 : 1
      }
      return subA.label < subB.label ? -1 : 1
    })
    const subjectsB = dataB.subjects.sort((subA, subB) => {
      if (typeOrder === 'DESC') {
        return subA.label > subB.label ? -1 : 1
      }
      return subA.label < subB.label ? -1 : 1
    })
    if (typeOrder === 'DESC') {
      return subjectsA[0]?.label > subjectsB[0]?.label ? -1 : 1
    }
    return subjectsA[0]?.label < subjectsB[0]?.label ? -1 : 1
  })
  return newDatas.map((element) => ({
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
  const newDatas = datasTable
    .sort((dataA, dataB) => {
      const sessionsA = dataA.subjects
        .map((sub) => {
          const subSess = sub.sessions.sort((sA, sB) => {
            if (typeOrder === 'DESC') {
              return sA.label > sB.label ? -1 : 1
            }
            return sA.label < sB.label ? -1 : 1
          })
          return subSess
        })
        .flat()
        .sort((dataA, dataB) => {
          if (typeOrder === 'DESC') {
            return dataA.label > dataB.label ? -1 : 1
          }
          return dataA.label < dataB.label ? -1 : 1
        })
      const sessionsB = dataB.subjects
        .map((sub) => {
          const subSess = sub.sessions.sort((sA, sB) => {
            if (typeOrder === 'DESC') {
              return sA.label > sB.label ? -1 : 1
            }
            return sA.label < sB.label ? -1 : 1
          })
          return subSess
        })
        .flat()
        .sort((dataA, dataB) => {
          if (typeOrder === 'DESC') {
            return dataA.label > dataB.label ? -1 : 1
          }
          return dataA.label < dataB.label ? -1 : 1
        })
      if (typeOrder === 'DESC') {
        return sessionsA[0]?.label > sessionsB[0]?.label ? -1 : 1
      }
      return sessionsA[0]?.label < sessionsB[0]?.label ? -1 : 1
    })
    .map((element) => ({
      ...element,
      subjects: element.subjects
        .sort((subA, subB) => {
          const subSessA = subA.sessions.sort((sA, sB) => {
            if (typeOrder === 'DESC') {
              return sA.label > sB.label ? -1 : 1
            }
            return sA.label < sB.label ? -1 : 1
          })
          const subSessB = subB.sessions.sort((sA, sB) => {
            if (typeOrder === 'DESC') {
              return sA.label > sB.label ? -1 : 1
            }
            return sA.label < sB.label ? -1 : 1
          })
          if (typeOrder === 'DESC') {
            return subSessA[0]?.label > subSessB[0]?.label ? -1 : 1
          }
          return subSessA[0]?.label < subSessB[0]?.label ? -1 : 1
        })
        .map((sub) => ({
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
  const newDatas = datasTable
    .sort((dataA, dataB) => {
      const sessionsA = dataA.subjects
        .map((sub) => {
          return sub.sessions
            .map((ses) => {
              const dataTypeA = ses.datatypes.sort((sA, sB) => {
                if (typeOrder === 'DESC') {
                  return sA.label > sB.label ? -1 : 1
                }
                return sA.label < sB.label ? -1 : 1
              })
              return dataTypeA
            })
            .flat()
        })
        .flat()
        .sort((dataA, dataB) => {
          if (typeOrder === 'DESC') {
            return dataA.label > dataB.label ? -1 : 1
          }
          return dataA.label < dataB.label ? -1 : 1
        })
      const sessionsB = dataB.subjects
        .map((sub) => {
          return sub.sessions
            .map((ses) => {
              const dataTypeA = ses.datatypes.sort((sA, sB) => {
                if (typeOrder === 'DESC') {
                  return sA.label > sB.label ? -1 : 1
                }
                return sA.label < sB.label ? -1 : 1
              })
              return dataTypeA
            })
            .flat()
        })
        .flat()
        .sort((dataA, dataB) => {
          if (typeOrder === 'DESC') {
            return dataA.label > dataB.label ? -1 : 1
          }
          return dataA.label < dataB.label ? -1 : 1
        })
      if (typeOrder === 'DESC') {
        return sessionsA[0]?.label > sessionsB[0]?.label ? -1 : 1
      }
      return sessionsA[0]?.label < sessionsB[0]?.label ? -1 : 1
    })
    .map((element) => ({
      ...element,
      subjects: element.subjects
        .sort((subA, subB) => {
          const subSessA = subA.sessions
            .map((ss) => {
              return ss.datatypes.sort((sA, sB) => {
                if (typeOrder === 'DESC') {
                  return sA.label > sB.label ? -1 : 1
                }
                return sA.label < sB.label ? -1 : 1
              })
            })
            .flat()
            .sort((dataA, dataB) => {
              if (typeOrder === 'DESC') {
                return dataA.label > dataB.label ? -1 : 1
              }
              return dataA.label < dataB.label ? -1 : 1
            })
          const subSessB = subB.sessions
            .map((ss) => {
              return ss.datatypes.sort((sA, sB) => {
                if (typeOrder === 'DESC') {
                  return sA.label > sB.label ? -1 : 1
                }
                return sA.label < sB.label ? -1 : 1
              })
            })
            .flat()
            .sort((dataA, dataB) => {
              if (typeOrder === 'DESC') {
                return dataA.label > dataB.label ? -1 : 1
              }
              return dataA.label < dataB.label ? -1 : 1
            })
          if (typeOrder === 'DESC') {
            return subSessA[0]?.label > subSessB[0]?.label ? -1 : 1
          }
          return subSessA[0]?.label < subSessB[0]?.label ? -1 : 1
        })
        .map((sub) => ({
          ...sub,
          sessions: sub.sessions
            .sort((ssA, ssB) => {
              const dataTypeA = ssA.datatypes.sort((sA, sB) => {
                if (typeOrder === 'DESC') {
                  return sA.label > sB.label ? -1 : 1
                }
                return sA.label < sB.label ? -1 : 1
              })
              const dataTypeB = ssB.datatypes.sort((sA, sB) => {
                if (typeOrder === 'DESC') {
                  return sA.label > sB.label ? -1 : 1
                }
                return sA.label < sB.label ? -1 : 1
              })
              if (typeOrder === 'DESC') {
                return dataTypeA[0]?.label > dataTypeB[0]?.label ? -1 : 1
              }
              return dataTypeA[0]?.label < dataTypeB[0]?.label ? -1 : 1
            })
            .map((ssA) => ({
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
  const newDatas = datasTable
    .sort((dataA, dataB) => {
      const typeA = dataA.subjects
        .map((sub) => {
          return sub.sessions
            .map((s) => {
              return s.datatypes
                .map((type) => {
                  return type.images.sort((imageA, imageB) => {
                    if (typeOrder === 'DESC') {
                      return imageA.image_attributes[key] > imageB.image_attributes[key]
                        ? -1
                        : 1
                    }
                    return imageA.image_attributes[key] < imageB.image_attributes[key]
                      ? -1
                      : 1
                  })
                })
                .flat()
            })
            .flat()
        })
        .flat()
        .sort((dataA, dataB) => {
          if (typeOrder === 'DESC') {
            return dataA.image_attributes[key] > dataB.image_attributes[key] ? -1 : 1
          }
          return dataA.image_attributes[key] < dataB.image_attributes[key] ? -1 : 1
        })
      const typeB = dataB.subjects
        .map((sub) => {
          return sub.sessions
            .map((s) => {
              return s.datatypes
                .map((type) => {
                  return type.images.sort((imageA, imageB) => {
                    if (typeOrder === 'DESC') {
                      return imageA.image_attributes[key] > imageB.image_attributes[key]
                        ? -1
                        : 1
                    }
                    return imageA.image_attributes[key] < imageB.image_attributes[key]
                      ? -1
                      : 1
                  })
                })
                .flat()
            })
            .flat()
            .sort((dataA, dataB) => {
              if (typeOrder === 'DESC') {
                return dataA.image_attributes[key] > dataB.image_attributes[key] ? -1 : 1
              }
              return dataA.image_attributes[key] < dataB.image_attributes[key] ? -1 : 1
            })
        })
        .flat()
        .sort((dataA, dataB) => {
          if (typeOrder === 'DESC') {
            return dataA.image_attributes[key] > dataB.image_attributes[key] ? -1 : 1
          }
          return dataA.image_attributes[key] < dataB.image_attributes[key] ? -1 : 1
        })

      if (typeOrder === 'DESC') {
        return typeA[0]?.image_attributes[key] > typeB[0]?.image_attributes[key] ? -1 : 1
      }
      return typeA[0]?.image_attributes[key] < typeB[0]?.image_attributes[key] ? -1 : 1
    })
    .map((element) => ({
      ...element,
      subjects: element.subjects
        .sort((subA, subB) => {
          const subSessA = subA.sessions
            .map((ss) => {
              return ss.datatypes
                .map((type) => {
                  return type.images.sort((sA, sB) => {
                    if (typeOrder === 'DESC') {
                      return sA.image_attributes[key] > sB.image_attributes[key] ? -1 : 1
                    }
                    return sA.image_attributes[key] < sB.image_attributes[key] ? -1 : 1
                  })
                })
                .flat()
            })
            .flat()
            .sort((dataA, dataB) => {
              if (typeOrder === 'DESC') {
                return dataA.image_attributes[key] > dataB.image_attributes[key] ? -1 : 1
              }
              return dataA.image_attributes[key] < dataB.image_attributes[key] ? -1 : 1
            })
          const subSessB = subB.sessions
            .map((ss) => {
              return ss.datatypes
                .map((type) => {
                  return type.images.sort((sA, sB) => {
                    if (typeOrder === 'DESC') {
                      return sA.image_attributes[key] > sB.image_attributes[key] ? -1 : 1
                    }
                    return sA.image_attributes[key] < sB.image_attributes[key] ? -1 : 1
                  })
                })
                .flat()
            })
            .flat()
            .sort((dataA, dataB) => {
              if (typeOrder === 'DESC') {
                return dataA.image_attributes[key] > dataB.image_attributes[key] ? -1 : 1
              }
              return dataA.image_attributes[key] < dataB.image_attributes[key] ? -1 : 1
            })
          if (typeOrder === 'DESC') {
            return subSessA[0]?.image_attributes[key] > subSessB[0]?.image_attributes[key]
              ? -1
              : 1
          }
          return subSessA[0]?.image_attributes[key] < subSessB[0]?.image_attributes[key]
            ? -1
            : 1
        })
        .map((sub) => ({
          ...sub,
          sessions: sub.sessions
            .sort((ssA, ssB) => {
              const dataTypeA = ssA.datatypes
                .map((type) => {
                  return type.images.sort((sA, sB) => {
                    if (typeOrder === 'DESC') {
                      return sA.image_attributes[key] > sB.image_attributes[key] ? -1 : 1
                    }
                    return sA.image_attributes[key] < sB.image_attributes[key] ? -1 : 1
                  })
                })
                .flat()
              const dataTypeB = ssB.datatypes
                .map((type) => {
                  return type.images.sort((sA, sB) => {
                    if (typeOrder === 'DESC') {
                      return sA.image_attributes[key] > sB.image_attributes[key] ? -1 : 1
                    }
                    return sA.image_attributes[key] < sB.image_attributes[key] ? -1 : 1
                  })
                })
                .flat()
              if (typeOrder === 'DESC') {
                return dataTypeA[0]?.image_attributes[key] >
                  dataTypeB[0]?.image_attributes[key]
                  ? -1
                  : 1
              }
              return dataTypeA[0]?.image_attributes[key] <
                dataTypeB[0]?.image_attributes[key]
                ? -1
                : 1
            })
            .map((ssA) => ({
              ...ssA,
              datatypes: ssA.datatypes
                .sort((typeA, typeB) => {
                  const imageA = typeA.images.sort((sA, sB) => {
                    if (typeOrder === 'DESC') {
                      return sA.image_attributes[key] > sB.image_attributes[key] ? -1 : 1
                    }
                    return sA.image_attributes[key] < sB.image_attributes[key] ? -1 : 1
                  })
                  const imageB = typeB.images.sort((sA, sB) => {
                    if (typeOrder === 'DESC') {
                      return sA.image_attributes[key] > sB.image_attributes[key] ? -1 : 1
                    }
                    return sA.image_attributes[key] < sB.image_attributes[key] ? -1 : 1
                  })
                  if (typeOrder === 'DESC') {
                    return imageA[0]?.image_attributes[key] >
                      imageB[0]?.image_attributes[key]
                      ? -1
                      : 1
                  }
                  return imageA[0]?.image_attributes[key] < imageB[0]?.image_attributes[key]
                    ? -1
                    : 1
                })
                .map((type) => ({
                  ...type,
                  images: type.images.sort((sA, sB) => {
                    if (typeOrder === 'DESC') {
                      return sA.image_attributes[key] > sB.image_attributes[key] ? -1 : 1
                    }
                    return sA.image_attributes[key] < sB.image_attributes[key] ? -1 : 1
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
