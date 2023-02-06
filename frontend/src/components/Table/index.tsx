import { Box, styled, Typography } from '@mui/material'
import { FC, useCallback } from 'react'
import ReactPaginate from 'react-paginate'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

type Column = {
  width?: number | string
  title: string
  dataIndex?: string
  name?: string
  render?: (
    item?: any,
    value?: any,
    index?: number,
  ) => JSX.Element | null | undefined
}

type TableComponentProps = {
  data?: any[]
  className?: string
  columns?: Column[]
  paginate?: {
    page: number
    total: number
    page_size: number
    breakLabel?: string
    nextLabel?: string
    previousLabel?: string
    pageRangeDisplayed?: number
    renderOnZeroPageCount?: string
    onPageChange?: (selectedItem: { selected: number }) => any
  }
}

const TableComponent: FC<TableComponentProps> = (props) => {
  const { data = [], columns = [], paginate, className } = props
  const pageCount = (paginate?.total || 0) / (paginate?.page_size || 1)

  const renderCol = useCallback((col: Column, item: any, index: number) => {
    const value = item[col.name || col.dataIndex || '']
    if (col.render) return col.render(item, value, index)
    return value || null
  }, [])

  return (
    <Box className={className}>
      <Table>
        <Thead>
          <Tr>
            {columns.map((col, iCol) => (
              <Th
                style={{ width: col.width }}
                key={col.dataIndex || col.name || iCol}
              >
                {col.title}
              </Th>
            ))}
          </Tr>
        </Thead>
        <TBody>
          {data.map((item, index) => (
            <Tr key={item.id || index}>
              {columns.map((col, iCol) => (
                <Td key={col.dataIndex || col.name || iCol}>
                  {renderCol(col, item, index)}
                </Td>
              ))}
            </Tr>
          ))}
        </TBody>
      </Table>
      {!data.length ? <NoData>No Data</NoData> : null}
      {pageCount ? (
        <MyPaginate
          disableInitialCallback
          marginPagesDisplayed={3}
          pageRangeDisplayed={3}
          breakLabel={'...'}
          pageCount={pageCount}
          previousLabel={<KeyboardArrowLeftIcon />}
          nextLabel={<ChevronRightIcon />}
          {...paginate}
        />
      ) : null}
    </Box>
  )
}

const MyPaginate = styled(ReactPaginate)`
  margin-bottom: 2rem;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  list-style-type: none;
  padding: 1rem 0;
  li a {
    padding: 0.6rem 1rem;
    cursor: pointer;
  }
  li.previous,
  li.next {
    margin-top: -2px;
  }
  li.previous.disabled,
  li.next.disabled {
    opacity: 0.4;
  }
  li.previous a,
  li.next a,
  li.break a {
    border-color: transparent;
  }
  li.active a {
    background-color: #0366d6;
    border-color: transparent;
    color: white;
    min-width: 32px;
  }
  li.disabled a {
    color: grey;
  }
  li.disable,
  li.disabled a {
    cursor: default;
  }
  li.selected {
    color: #1677ff;
    font-weight: 600;
  }
`

const Table = styled('table')({
  boxSizing: 'border-box',
  width: '100%',
  borderCollapse: 'collapse',
})

const Thead = styled('thead')({})

const Tr = styled('tr')({})

const Th = styled('th')(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'left',
  backgroundColor: '#E1DEDB',
  color: 'rgba(0,0,0,.88)',
  fontWeight: 600,
  borderBottom: '1px solid #f0f0f0',
  ':first-of-type': {
    borderTopLeftRadius: 4,
  },
  ':last-of-type': {
    borderTopRightRadius: 4,
  },
}))

const TBody = styled('tbody')(() => ({}))

const Td = styled('td')(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: '1px solid #f0f0f0',
}))

const NoData = styled(Typography)({
  textAlign: 'center',
  fontWeight: '600',
  fontSize: 20,
  paddingTop: 16,
})

export default TableComponent
