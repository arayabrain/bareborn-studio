import { Box, styled, Typography } from '@mui/material'
import { MouseEvent, FC, Fragment, useState } from 'react'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'

type Column = {
  width?: number | string
  title: string
  dataIndex?: string
  name?: string
  child?: string
  filter?: boolean
  render?: (
    item?: any,
    value?: any,
    index?: number,
  ) => JSX.Element | null | undefined | string | number
}

type TableComponentProps = {
  data?: any[]
  className?: string
  columns?: Column[]
  orderBy?: 'ASC' | 'DESC'
  orderKey?: string
  onSort?: (orderKey: string, orderBy: string) => any
  rowClick?: (row: any) => any
  draggable?: boolean
  onDrag?: (row?: any) => any
  onDragEnd?: (row?: any) => any
  expands?: string[]
  defaultExpand?: boolean
  showBorderDrag?: boolean
}

type RenderColumnProps = {
  item: any
  columns: Column[]
  orderBy?: 'ASC' | 'DESC'
  orderKey?: string
  onSort?: (orderKey: string, orderBy: string) => any
  rowClick?: (row: any) => any
  draggable?: boolean
  onDrag?: (row?: any) => any
  onDragEnd?: (row?: any) => any
  expands?: string[]
  index: number
  defaultExpand?: boolean
  dataShow?: boolean
  draggableProps?: boolean
  showBorderDrag?: boolean
}

const renderCol = (col: Column, item: any, index: number, child?: boolean) => {
  const key = col.name || col.dataIndex || ''
  const value = item[child ? col.child || key : key]
  if (col.render) return col.render(item, value, index)
  return (
    (typeof value === 'object' || Array.isArray(value)
      ? col.child
        ? null
        : JSON.stringify(value)
      : value) || null
  )
}

const ChildCol = (props: RenderColumnProps & { keyExpand: string }) => {
  const { columns, item, index, rowClick, keyExpand, defaultExpand } = props
  const [show, setShow] = useState<boolean>(!!defaultExpand)

  const onClickCol = (event: MouseEvent<HTMLTableDataCellElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setShow(!show)
  }

  return (
    <Fragment>
      <Tr
        onClick={() => rowClick?.(item)}
        style={{ backgroundColor: 'rgb(238, 238, 238)' }}
      >
        {columns.map((column) => {
          const key = column.name || column.dataIndex
          return (
            <Td
              key={`row_child_${column.name || column.dataIndex}`}
              onClick={key === keyExpand ? onClickCol : undefined}
              style={{ cursor: key === keyExpand ? 'pointer' : 'default' }}
            >
              <ElementFlex>
                {key === keyExpand ? (
                  <ArrowDropDownIconWrap
                    style={{ transform: `rotate(${show ? 180 : 0}deg)` }}
                  />
                ) : null}
                {key === keyExpand
                  ? renderCol(column, item, index, key === keyExpand)
                  : null}
              </ElementFlex>
            </Td>
          )
        })}
      </Tr>
      {show ? (
        <RenderColumn
          {...props}
          draggable={props.draggableProps}
          item={item}
          dataShow
        />
      ) : null}
    </Fragment>
  )
}

const RenderColumn = (props: RenderColumnProps) => {
  const { columns, item, index, rowClick, showBorderDrag, dataShow } = props
  const { draggable, onDrag, onDragEnd, expands } = props

  const getKeyExpand = () => {
    if (!Array.isArray(expands) || !expands?.length) return false
    return expands.find((el) => Array.isArray(item[el]))
  }

  const keyExpand = getKeyExpand()

  if (keyExpand) {
    const itemData = item[keyExpand]
    return itemData.map((i: any, index: number) => (
      <ChildCol
        key={`col_${i.id || index}`}
        {...props}
        item={i}
        keyExpand={keyExpand}
      />
    ))
  }

  return (
    <Tr
      onClick={() => rowClick?.(item)}
      draggable={draggable}
      onDragStart={() => onDrag?.(item)}
      onDragEnd={onDragEnd}
      style={{
        borderStyle: 'dashed',
        borderColor: '#1976d2',
        borderWidth: showBorderDrag && draggable ? 2 : 0,
        transition: 'all 0.3s',
        backgroundColor: dataShow ? 'transparent' : 'rgb(238, 238, 238)',
      }}
    >
      {columns.map((column) => (
        <Td key={`col_${column.name || column.dataIndex}`}>
          {renderCol(column, item, index)}
        </Td>
      ))}
    </Tr>
  )
}

const DatabaseTableComponent: FC<TableComponentProps> = (props) => {
  const { className, orderKey, orderBy, onSort, draggable, ...p } = props
  const { data = [], columns = [] } = props
  return (
    <TableWrap className={className}>
      <DataTable style={{ width: 150 * columns.length }}>
        <Thead>
          <Tr>
            {columns.map((col, iCol) => (
              <Th
                onClick={() =>
                  col.filter &&
                  onSort?.(
                    col.name || col.dataIndex || '',
                    orderBy === 'ASC' ? 'DESC' : 'ASC',
                  )
                }
                style={{
                  width: col.width,
                  cursor: col?.filter ? 'pointer' : 'inherit',
                }}
                key={col.dataIndex || col.name || iCol}
              >
                {col.title}
                {col?.filter ? (
                  <ArrowDownwardIconOrder
                    style={{
                      transform: `rotate(${orderBy === 'ASC' ? 180 : 0}deg)`,
                      opacity: orderKey === col.name ? 1 : 0.4,
                    }}
                  />
                ) : null}
              </Th>
            ))}
          </Tr>
        </Thead>
        <TBody>
          {data.map((item, index) => (
            <RenderColumn
              item={item}
              index={index}
              columns={columns}
              {...p}
              draggable={false}
              draggableProps={draggable}
              key={`row_table_${item.id}_${index}`}
            />
          ))}
        </TBody>
      </DataTable>
      {!data.length ? <NoData>No Data</NoData> : null}
    </TableWrap>
  )
}

const ArrowDropDownIconWrap = styled(ArrowDropDownIcon)({
  transition: 'transform 0.3s',
})

const ElementFlex = styled(Box)({
  display: 'flex',
  alignItems: 'center',
})

const TableWrap = styled(Box)({
  overflowX: 'scroll',
})

const DataTable = styled('table')({
  boxSizing: 'border-box',
  minWidth: '100%',
  borderCollapse: 'collapse',
  border: '1px solid rgba(224, 224, 224, 1)',
})

const Thead = styled('thead')({})

const Tr = styled('tr')({})

const Th = styled('th')(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'left',
  backgroundColor: 'none',
  color: 'rgba(0,0,0,.88)',
  fontWeight: 600,
  border: '1px solid rgba(224, 224, 224, 1)',
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
  borderBottom: '1px solid rgba(224, 224, 224, 1)',
  width: 118,
}))

const NoData = styled(Typography)({
  textAlign: 'center',
  fontWeight: '600',
  fontSize: 20,
  paddingTop: 16,
})

const ArrowDownwardIconOrder = styled(ArrowDownwardIcon)({
  width: 16,
  height: 16,
  transition: 'all 0.3s',
  marginBottom: -3,
  marginLeft: 5,
})

export default DatabaseTableComponent
