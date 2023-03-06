import { Box, styled, Typography } from '@mui/material'
import {FC, useState} from 'react'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

type Column = {
  width?: number | string
  title: string
  dataIndex?: string
  name?: string
  filter?: boolean
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
}

const renderCol = (col: Column, item: any, index: number) => {
  const value = item[col.name || col.dataIndex || '']
  if (col.render) return col.render(item, value, index)
  return value || null
}

const RenderColumn = (
  {column, item, index, dropDown, click,show}
  : {column: Column[], item: any, index: number, dropDown?: any, click?: any, show?: boolean}
) => {
  return (
    <Tr key={item.id || index}>
      {column.map((col, iCol) => (
        <Td
          key={col.dataIndex || col.name || iCol}
          style={{cursor:col.name === dropDown ? 'pointer' : 'inherit'}}
          onClick={click ? click : null}
        >
          {
            col.name === dropDown ? show ?
              <ArrowDropUpIcon style={{marginBottom: '-8px', marginLeft:'-24px'}} /> :
              <ArrowDropDownIcon style={{marginBottom: '-8px', marginLeft:'-24px'}} /> : null
          }
          {renderCol(col, item, index)}
        </Td>
      ))}
    </Tr>
  )
}

const RenderDataset = ({column, item, index} : {column: Column[], item: any, index: number}) => {
  const [show, setShow] = useState<boolean>(false);
  return (
    <>
      <RenderColumn
        column={column}
        item={item}
        index={index}
        dropDown={item?.dataset ? 'dataset_title' : ''}
        click={() => setShow(!show)}
        show={show}
      />
      {
        !(item?.dataset && show) ? null : item.dataset.map((itemData: any, idx: number) =>
          <RenderColumn
            column={column}
            item={itemData}
            index={idx}
          />)
      }
    </>
  )
}

const RenderSectionColumn = ({column, item, index} : {column: Column[], item: any, index: number}) => {
  const [show, setShow] = useState<boolean>(false);
  return (
    <>
      <RenderColumn
        column={column}
        item={item}
        index={index}
        dropDown={item?.dataset ? 'session_name' : ''}
        click={() => setShow(!show)}
        show={show}
      />
      {
        item?.dataset && show ? item.dataset.map((itemData: any, idx: number) => <RenderDataset
          item={itemData}
          index={idx}
          key={itemData.id || index}
          column={column}
        />) : null
      }
    </>
  )
}

const DatabaseTableComponent: FC<TableComponentProps> = (props) => {
  const { data = [], columns = [], className } = props
  
  return (
    <TableWrap className={className}>
      <DataTable style={{width: 150 * columns.length}}>
        <Thead>
          <Tr>
            {columns.map((col, iCol) => (
              <Th
                style={{ width: col.width, cursor: col?.filter? 'pointer' : 'inherit'}}
                key={col.dataIndex || col.name || iCol}
              >
                {col.title}
                {col?.filter ? <ArrowDownwardIcon style={{width: 16, height: 16}}/> : null}
              </Th>
            ))}
          </Tr>
        </Thead>
        <TBody>
          {data.map((item, index) => <RenderSectionColumn
            item={item}
            index={index}
            column={columns}
            key={item.id || index}
          />)}
        </TBody>
      </DataTable>
      {!data.length ? <NoData>No Data</NoData> : null}
    </TableWrap>
  )
}

const TableWrap = styled(Box)({
  overflowX: "scroll",
})

const DataTable = styled('table')({
  boxSizing: 'border-box',
  minWidth: '100%',
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
  width: 118,
}))

const NoData = styled(Typography)({
  textAlign: 'center',
  fontWeight: '600',
  fontSize: 20,
  paddingTop: 16,
})

export default DatabaseTableComponent
