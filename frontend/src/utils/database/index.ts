import { DatabaseData, Image, Viewer } from 'pages/Database'

export const onGet = (
  datas: DatabaseData,
  record: Viewer,
  isSub?: boolean,
): Image | undefined => {
  // const imageNext = datas.reduce((pre: any, current, index) => {
  //   if (current.id === record.parent_id) {
  //     const sessionIndex = current.sessions?.findIndex(
  //       (e) => e.id === record.session_id,
  //     )
  //     if (typeof sessionIndex === 'number' && sessionIndex >= 0) {
  //       const session = current.sessions?.[sessionIndex]
  //       if (session) {
  //         const findImageIndex = session.datatypes.images.findIndex(
  //           (img) => img.id === record.id,
  //         )
  //         const imageNow =
  //           session.datatypes.images[findImageIndex + (isSub ? -1 : 1)]
  //         if (imageNow) {
  //           pre = imageNow
  //         }
  //       }
  //     }
  //   }
  //   return pre
  // }, undefined)
  // return imageNext
  return undefined
}

const sortWithLabName = (
  datasTable: DatabaseData[],
  orderKey: string,
  typeOrder?: 'ASC' | 'DESC',
) => {
  // const newDatas = JSON.parse(JSON.stringify(datasTable)).sort(
  //   (a: any, b: any) => {
  //     if (typeOrder === 'DESC') {
  //       return a[orderKey] > b[orderKey] ? -1 : 1
  //     }
  //     return a[orderKey] < b[orderKey] ? -1 : 1
  //   },
  // )
  // return newDatas
}

const sortWithSession = (
  datasTable: DatabaseData[],
  typeOrder?: 'ASC' | 'DESC',
) => {
  // const newDatas = JSON.parse(JSON.stringify(datasTable)).sort(
  //   (a: any, b: any) => {
  //     if (typeOrder !== 'DESC') {
  //       if (!b.sessions) return 1
  //       return (
  //         a.sessions?.sort((a: any, b: any) => a.id - b.id)[0].id -
  //         b.sessions?.sort((a: any, b: any) => a.id - b.id)[0].id
  //       )
  //     }
  //     if (!b.sessions) return -1
  //     return (
  //       b.sessions?.sort((a: any, b: any) => b.id - a.id)[0].id -
  //       a.sessions?.sort((a: any, b: any) => b.id - a.id)[0].id
  //     )
  //   },
  // )
  // return newDatas
}

const sortSubject = (
  datasTable: DatabaseData[],
  typeOrder?: 'ASC' | 'DESC',
) => {
  // const newDatas = JSON.parse(JSON.stringify(datasTable))
  //   .sort((dA: any, dB: any) => {
  //     if (typeOrder === 'DESC') {
  //       if (!dB.sessions) return 1
  //       return dA.sessions?.sort((a: any, b: any) =>
  //         a.subject > b.subject ? -1 : 1,
  //       )[0].subject >
  //         dB.sessions?.sort((a: any, b: any) =>
  //           a.subject > b.subject ? -1 : 1,
  //         )[0].subject
  //         ? -1
  //         : 1
  //     }
  //     if (!dB.sessions) return -1
  //     return dB.sessions?.sort((a: any, b: any) =>
  //       b.subject > a.subject ? -1 : 1,
  //     )[0].subject >
  //       dA.sessions?.sort((a: any, b: any) =>
  //         b.subject > a.subject ? -1 : 1,
  //       )[0].subject
  //       ? -1
  //       : 1
  //   })
  //   .map((el: any) => ({
  //     ...el,
  //     sessions: el.sessions?.sort((a: any, b: any) => {
  //       if (typeOrder === 'ASC') {
  //         return a.subject > b.subject ? 1 : -1
  //       }
  //       return b.subject > a.subject ? -1 : 1
  //     }),
  //   }))
  // return newDatas
}

const sortDatatypes = (
  datasTable: DatabaseData[],
  typeOrder?: 'ASC' | 'DESC',
) => {
  // const newDatas = JSON.parse(JSON.stringify(datasTable)).sort(
  //   (dA: any, dB: any) => {
  //     if (typeOrder !== 'DESC') {
  //       if (!dB.sessions) return 1
  //       return (
  //         dA.sessions?.sort(
  //           (a: any, b: any) => a.datatypes?.title - b.datatypes?.title,
  //         )[0].title -
  //         dB.sessions?.sort(
  //           (a: any, b: any) => a.datatypes?.title - b.datatypes?.title,
  //         )[0].title
  //       )
  //     }
  //     if (!dB.sessions) return -1
  //     return (
  //       dB.sessions?.sort(
  //         (a: any, b: any) => b.datatypes?.title - a.datatypes?.title,
  //       )[0].datatypes?.title -
  //       dA.sessions?.sort(
  //         (a: any, b: any) => b.datatypes?.title - a.datatypes?.title,
  //       )[0].datatypes?.title
  //     )
  //   },
  // )
  // return newDatas
}

const sortImages = (datasTable: DatabaseData, typeOrder?: 'ASC' | 'DESC') => {
  // if (typeOrder === 'ASC') return datasTable
  // return JSON.parse(JSON.stringify(datasTable)).reverse()
}

export const onSort = (
  datasTable: any[],
  typeOrder: 'ASC' | 'DESC',
  orderKey: string,
  type: string = 'tree',
) => {
  // let newDatas = datasTable
  // if (type === 'tree') {
  //   if (['lab_name', 'user_name', 'recording_time'].includes(orderKey)) {
  //     newDatas = sortWithLabName(datasTable, orderKey, typeOrder)
  //   } else if (orderKey === 'sessions') {
  //     newDatas = sortWithSession(datasTable, typeOrder)
  //   } else if (orderKey === 'subject') {
  //     newDatas = sortSubject(datasTable, typeOrder)
  //   } else if (orderKey === 'datatypes') {
  //     newDatas = sortDatatypes(datasTable, typeOrder)
  //   } else {
  //     newDatas = sortImages(datasTable, typeOrder)
  //   }
  // } else {
  //   newDatas = datasTable.sort((a: any, b: any) => {
  //     if (typeOrder === 'DESC') {
  //       return a[orderKey] > b[orderKey] ? -1 : 1
  //     }
  //     return a[orderKey] > b[orderKey] ? 1 : -1
  //   })
  // }
  // return {
  //   typeOrder,
  //   data: newDatas,
  // }
}
