import React, {useState} from 'react'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import {MouseType} from './ExperimentTable'
import { ExperimentStatusIcon } from './ExperimentStatusIcon'
import {Button} from "@mui/material";
import ImageAlignment from "../ImageAlignment";


export const CollapsibleTable = React.memo<{
  open: boolean
  data?: MouseType[]
}>(({ open , data}) => {
  return (
    <TableRow>
      <TableCell sx={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <Box margin={1}>
            <Table size="small" aria-label="purchases">
            <Head />
            {data && data.map((item) => {
              return (
                <Body key={item?.unique_id} data={item}/>
              )
            })}
            </Table>
          </Box>
        </Collapse>
      </TableCell>
    </TableRow>
  )
})

const Head = React.memo(() => {
  return (
    <TableHead>
      <TableRow>
        <TableCell>Function</TableCell>
        <TableCell>nodeID</TableCell>
        <TableCell>Success</TableCell>
        <TableCell>Output</TableCell>
      </TableRow>
    </TableHead>
  )
})

const Body = React.memo<{
    data: MouseType
}>(({data}) => {
  return (
    <TableBody>
      <TableRowOfFunction data={data} />
    </TableBody>
  )
})

const TableRowOfFunction = ({ data } : {data: MouseType}) => {
    const {name, success, outputs, unique_id} = data
    const [popup, setPopup] = useState(false)
  return (
    <>
        <TableRow >
            <TableCell component="th" scope="row">
                {name}
            </TableCell>
            <TableCell>{unique_id}</TableCell>
            <TableCell>
                <ExperimentStatusIcon status={success} />
            </TableCell>
            <TableCell>
                <Button disabled={success === 'success'? false : true} onClick={() => setPopup(true)}>
                    <OpenInNewIcon />
                </Button>
            </TableCell>
        </TableRow>
        <ImageAlignment
            open={popup}
            urls={outputs}
            onClose={() => setPopup(false)}
            readOnly={true}
        />
    </>
  )
}
