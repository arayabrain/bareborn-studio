import {Box, Button, IconButton, Input, styled} from "@mui/material";
import React, {useMemo, useState} from 'react'
import DatabaseTableComponent from "./DatabaseTable";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const PopupSearch = () => {
  return (
    <Popup>
      <PopupInner>
        <h2>Filter</h2>
        <InputSearch name={'lab_name'} />
        <InputSearch name={'user_name'} />
        <InputSearch name={'date'} />
        <InputSearch name={'sample_name'} />
      </PopupInner>
    </Popup>
  )
}

export const defaultDatabase = [
  {
    id: '1',
    lab_name: 'lab1',
    user_name: 'hope',
    date: '2023/02/24',
  },
  {
    id: '2',
    lab_name: '',
    user_name: '',
    date: '',
    session_name: 'sess 1',
    dataset: [
      {
        id: '9',
        dataset_title: 'anat',
        dataset: [
          {
            id: '3',
            lab_name: '',
            user_name: '',
            date: '',
            session_name: '',
            dataset: {},
            type: 'T2_RARE',
            protocol: 'aaaaaaaa',
            size: '1234',
            voxel_size: '1234',
            control: true
          },
          {
            id: '4',
            lab_name: '',
            user_name: '',
            date: '',
            session_name: '',
            dataset: {},
            type: 'T2_RARE',
            protocol: 'aaaaaaaa',
            size: '1234',
            voxel_size: '1234',
            control: true
          },
        ]
      },
      {
        id: '10',
        dataset_title: 'anat 2',
        dataset: [
          {
            id: '7',
            lab_name: '',
            user_name: '',
            date: '',
            session_name: '',
            dataset: {},
            type: 'T2_RARE',
            protocol: 'aaaaaaaa',
            size: '1234',
            voxel_size: '1234',
            control: true
          },
        ]
      }
    ]
  },
  {
    id: '5',
    lab_name: '',
    user_name: '',
    date: '',
    session_name: 'sess 2',
    dataset: null
  },
]

const Database = () => {
    const [openPopup, setOpenPopup] = useState(false)
    const [data, setData] = useState(defaultDatabase)

    const columns = useMemo(
      () => [
        { title: 'Lab', name: 'lab_name' },
        { title: 'User', name: 'user_name' },
        { title: 'Date', name: 'date' },
        { title: 'Session', name: 'session_name'},
        { title: 'Dataset', name: 'dataset_title'},
        { title: 'Type', name: 'type', filter: true},
        { title: 'Protocol', name: 'protocol'},
        { title: 'Size', name: 'size'},
        { title: 'Voxel size', name: 'voxel_size'},
        {
          title: '',
          name: 'action',
          render: (data: any) => data.control ? (
            <BoxButton>
              <ButtonControl aria-label="Example">
                <EditIcon color={'inherit'} />
              </ButtonControl>
              <ButtonControl aria-label="Example">
                <DeleteIcon sx={{ color: 'red' }} />
              </ButtonControl>
            </BoxButton>
          ) : null,
        },
      ],
      [],
    )

    return (
        <DatabaseWrapper>
          <ProjectsTitle><span>Database</span><ButtonFilter onClick={()=> setOpenPopup(true)}>Search</ButtonFilter></ProjectsTitle>
          {
            openPopup && <PopupSearch />
          }
          <DatabaseTableComponent
            data={data}
            columns={columns}
          />
        </DatabaseWrapper>
    )
};

const DatabaseWrapper = styled(Box)(({ theme }) => ({
    width: '100%',
    padding: theme.spacing(2),
}))

const Popup = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100vh',
  display: 'flex',
  justifyContent:'center',
  alignItems: 'center',
  backgroundColor: '#cccccc80',
}))

const PopupInner = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2,3),
  backgroundColor: '#fff',
  borderRadius: theme.spacing(1),
}))

const InputSearch = styled(Input)(({ theme }) => ({
  padding: theme.spacing(2,3),
  backgroundColor: '#fff',
  borderRadius: theme.spacing(1),
}))


const BoxButton = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: theme.spacing(1),
}))

const ButtonFilter = styled(Button)(({ theme }) => ({
  margin: theme.spacing(2, 0),
  minWidth: 80,
  paddingLeft: theme.spacing( 2),
  paddingRight: theme.spacing( 2)
}))

const ButtonControl = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(0, 1)
}))

const ProjectsTitle = styled('h1')(({ theme }) => ({}))

export default Database