import { Box, Button, styled } from '@mui/material'
import ModalDeleteAccount from 'components/ModalDeleteAccount'
import TableComponent from 'components/Table'
import { useMemo, useState } from 'react'

const AccountManager = () => {
  const [openDelete, setOpenDelete] = useState(false)
  const [data, setData] = useState([
    {
      name: 'Title',
      address: 'Mail Address',
      role: 'Admin',
      last_login: '03/12/2022',
    },
  ])

  const handleCloseDelete = () => {
    setOpenDelete(false)
  }

  const onConfirmDelete = () => {
    setOpenDelete(true)
  }

  const onForgotPassword = () => {
    //todo call api
  }

  const onDelete = () => {
    //todo call api
    handleCloseDelete()
  }

  const columns = useMemo(
    () => [
      { title: 'Name', name: 'name' },
      { title: 'Mail Address', name: 'address' },
      { title: 'Role', name: 'role' },
      { title: 'Last Login', name: 'last_login' },
      {
        title: '',
        name: 'action',
        width: 185,
        render: () => (
          <>
            <ALink sx={{ color: 'red' }} onClick={onConfirmDelete}>
              Delete
            </ALink>
            <ALink sx={{ ml: 1.25 }} onClick={onForgotPassword}>
              Forgot Password
            </ALink>
          </>
        ),
      },
    ],
    [],
  )

  return (
    <AccountManagerWrapper>
      <ModalDeleteAccount
        titleSubmit="Delete Account"
        onClose={handleCloseDelete}
        open={openDelete}
        onSubmit={onDelete}
      />
      <BoxButton>
        <ButtonAdd variant="contained">Add</ButtonAdd>
      </BoxButton>
      <TableComponent
        paginate={{ total: 100, page: 1, page_size: 10 }}
        data={data}
        columns={columns}
      />
    </AccountManagerWrapper>
  )
}

const AccountManagerWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(2),
}))

const BoxButton = styled(Box)({
  display: 'flex',
  justifyContent: 'flex-end',
})

const ButtonAdd = styled(Button)(({ theme }) => ({
  margin: theme.spacing(2, 0),
  width: 100,
}))

const ALink = styled('a')({
  color: '#1677ff',
  textDecoration: 'none',
  cursor: 'pointer',
  userSelect: 'none',
})

export default AccountManager
