import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell, { tableCellClasses } from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import Paper from '@mui/material/Paper'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import ReplayIcon from '@mui/icons-material/Replay'
import DeleteIcon from '@mui/icons-material/Delete'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'

import { CollapsibleTable } from './CollapsibleTable'
import {
  selectExperimentsSatusIsUninitialized,
  selectExperimentsSatusIsFulfilled,
  selectExperimentsSatusIsError,
  selectExperimentsErrorMessage,
  selectExperimentList,
} from 'store/slice/Experiments/ExperimentsSelectors'
import {
  deleteExperimentByList,
  getExperiments,
} from 'store/slice/Experiments/ExperimentsActions'
import { ExperimentStatusIcon } from './ExperimentStatusIcon'
import { EXPERIMENTS_STATUS} from 'store/slice/Experiments/ExperimentsType'
import { useLocalStorage } from 'components/utils/LocalStorageUtil'
import {useNavigate} from "react-router-dom";

export type MouseType = {
    unique_id: string
    name: string
    success: EXPERIMENTS_STATUS
    outputs: string[]
}

export const ExperimentUidContext = React.createContext<string>('')

type Data = {
    pagenation: object
    records: {
        id: number
        name: string
        data?: MouseType[]
    }[]
    nodeDict: object
    edgeDict: object
    createAt: string
}

const data: Data = {
  "pagenation": {
    "page": 0,
    "limit": 0,
    "total": 0,
    "total_pages": 0
  },
  "records": [{
      "id": 0,
      "name": "MOUSE",
      "data": [{
          "unique_id": "caiman_cnmf_fq0042h2uj",
          "name": "caiman_cnmf",
          "success": "error",
          "outputs": [
              "/lib/test.nii",
              "/lib/test0.nii",
              "/lib/test1.nii"
          ]},
          {
          "unique_id": "caiman_mc_2rg3nrb410",
          "name": "caiman_mc",
          "success": "error",
          "outputs": [
              "/lib/test.nii",
              "/lib/test0.nii",
              "/lib/test1.nii"
          ]},
          {
          "unique_id": "input_0",
          "name": "mouse2p_2_donotouse.tiff",
          "success": "success",
          "outputs": [
              "/lib/test.nii",
              "/lib/test0.nii",
              "/lib/test1.nii"
          ]}
        ]
      },
      {
          "id": 1,
          "name": "MOUSE1",
          "data": [{
              "unique_id": "caiman_cnmf_fq0042h2uj",
              "name": "caiman_cnmf",
              "success": "error",
              "outputs": [
                  "/lib/test.nii",
                  "/lib/test0.nii",
                  "/lib/test1.nii"
              ]},
              {
                  "unique_id": "caiman_mc_2rg3nrb410",
                  "name": "caiman_mc",
                  "success": "error",
                  "outputs": [
                      "/lib/test.nii",
                      "/lib/test0.nii",
                      "/lib/test1.nii"
                  ]},
              {
                  "unique_id": "input_0",
                  "name": "mouse2p_2_donotouse.tiff",
                  "success": "success",
                  "outputs": [
                      "/lib/test.nii",
                      "/lib/test0.nii",
                      "/lib/test1.nii"
                  ]}
          ]
      },
      {
          "id": 2,
          "name": "MOUSE3"
      }
  ],
      "nodeDict": {},
      "edgeDict": {},
      "createAt": "1683214197"
}

export const ExperimentTable: React.FC = () => {
  const isUninitialized = useSelector(selectExperimentsSatusIsUninitialized)
  const isFulfilled = useSelector(selectExperimentsSatusIsFulfilled)
  const isError = useSelector(selectExperimentsSatusIsError)
  const dispatch = useDispatch()
  React.useEffect(() => {
    if (isUninitialized) {
      dispatch(getExperiments())
    }
  }, [dispatch, isUninitialized])
  if (isFulfilled) {
    return <TableImple />
  } else if (isError) {
    return <ExperimentsErrorView />
  } else {
    return null
  }
}

const ExperimentsErrorView: React.FC = () => {
  const message = useSelector(selectExperimentsErrorMessage)
  return (
    <Alert severity="error">
      <AlertTitle>failed to get experiments...</AlertTitle>
      {message}
    </Alert>
  )
}

const LOCAL_STORAGE_KEY_PER_PAGE = 'studio_experiment_table_per_page'

const TableImple = React.memo(() => {
  const experimentList = useSelector(selectExperimentList)
  const experimentListKeys = Object.keys(experimentList)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const onClickReload = () => {
    dispatch(getExperiments())
  }
  const [checkedList, setCheckedList] = useState<string[]>([])
  const [open, setOpen] = React.useState(false)
  const recordsIsEmpty = experimentListKeys.length === 0

  const onClickDelete = () => {
    setOpen(true)
  }
  const onClickCancel = () => {
    setOpen(false)
  }
  const onClickOk = () => {
    dispatch(deleteExperimentByList(checkedList))
    setCheckedList([])
    setOpen(false)
  }

  const onClickBack = () => {
    navigate('/projects')
  }

  const [page, setPage] = React.useState(0)

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const [rowsPerPage, setRowsPerPage] = useLocalStorage(
    LOCAL_STORAGE_KEY_PER_PAGE,
    10,
    (value) => {
      const valueNum = Number(value)
      return isNaN(valueNum) ? 10 : valueNum
    },
  )
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newValue = parseInt(event.target.value, 10)
    setRowsPerPage(newValue)
    setPage(0)
  }

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0
      ? Math.max(0, (1 + page) * rowsPerPage - experimentListKeys.length)
      : 0

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Button onClick={onClickBack}
        sx={{width: 'fit-content', textTransform: 'unset', fontSize: 20}}
      >
        <KeyboardBackspaceIcon /> Projects
      </Button>
      <Box sx={{display: 'flex', gap : 2, alignItems: 'center'}}>
        <Typography>Status : </Typography>
        <Box>
          <ExperimentStatusIcon status ={'success'}/>
        </Box>
        <Box>
          <Typography>YYYY/MM/DD</Typography>
          <Typography>HH/MI</Typography>
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        <Button
          sx={{
            margin: (theme) => theme.spacing(0, 1, 1, 0),
          }}
          variant="outlined"
          endIcon={<ReplayIcon />}
          onClick={onClickReload}
        >
          Reload
        </Button>
        <Button
          sx={{
            marginBottom: (theme) => theme.spacing(1),
          }}
          variant="outlined"
          color="error"
          endIcon={<DeleteIcon />}
          onClick={onClickDelete}
          disabled={checkedList.length === 0}
        >
          Delete
        </Button>
      </Box>
      <Dialog open={open}>
        <DialogTitle>Are you sure you want to delete?</DialogTitle>
        <DialogActions>
          <Button onClick={onClickCancel} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button onClick={onClickOk} variant="outlined" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
         <Paper
           elevation={0}
           variant="outlined"
           sx={{
               flexGlow: 1,
               height: '100%',
           }}
         >
           {
             data.records.map((item) => {
               const { name, id } = item
                return (
                <TableContainer key={id} component={Paper} elevation={0}>
                  <Table aria-label="collapsible table">
                    <TableBody>
                      <ExperimentUidContext.Provider
                        value={String(id)}
                        key={id}
                      >
                        <RowItem
                          data={item.data}
                          name={name}
                        />
                      </ExperimentUidContext.Provider>
                       {emptyRows > 0 && (
                         <TableRow
                           style={{
                             height: 53 * emptyRows,
                           }}
                          >
                            <TableCell colSpan={10} />
                          </TableRow>
                      )}
                      {recordsIsEmpty && (
                          <TableRow>
                            <TableCell colSpan={10}>
                              <Typography
                                  sx={{
                                    color: (theme) => theme.palette.text.secondary,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '300px',
                                    textAlign: 'center',
                                  }}
                                  variant="h6"
                              >
                                No Rows...
                              </Typography>
                            </TableCell>
                          </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                )
             })
           }
           <TablePagination
               rowsPerPageOptions={[5, 10, 25]}
               component="div"
               count={experimentListKeys.length}
               rowsPerPage={rowsPerPage}
               page={page}
               onPageChange={handleChangePage}
               onRowsPerPageChange={handleChangeRowsPerPage}
           />
         </Paper>
    </Box>
  )
})

const RowItem = React.memo<{
  name: string
  data?: MouseType[]
}>(({ name, data }) => {
  const [open, setOpen] = React.useState(false)
  return (
    <React.Fragment>
      <TableRow
        onClick={() => data && setOpen((prevOpen) => !prevOpen)}
        sx={{
          '& > *': {
            borderBottom: 'unset',
          },
          [`& .${tableCellClasses.root}`]: {
            borderBottomWidth: 0,
          },
        }}
      >
        <TableCell
          sx={{padding: '20px',
               display: 'flex',
               alignItems: 'center'
          }}
        >
          {name} {data && (!open ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />)}
        </TableCell>
      </TableRow>
      <CollapsibleTable data={data} open={open} />
    </React.Fragment>
  )
})
