import { Box, Button, styled } from '@mui/material'
import ModalDeleteAccount from 'components/ModalDeleteAccount'
import { useState } from 'react'

const AccountManager = () => {
  const [openDelete, setOpenDelete] = useState(false)

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
      <Table>
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Mail Address</Th>
            <Th>Role</Th>
            <Th>Last Login</Th>
            <Th sx={{ width: 185 }} />
          </Tr>
        </Thead>
        <TBody>
          <Tr>
            <Td>Name</Td>
            <Td>Mail Address</Td>
            <Td>Role</Td>
            <Td>Last Login</Td>
            <Td>
              <ALink sx={{ color: 'red' }} onClick={onConfirmDelete}>
                Delete
              </ALink>
              <ALink sx={{ ml: 1.25 }} onClick={onForgotPassword}>
                Forgot Password
              </ALink>
            </Td>
          </Tr>
        </TBody>
      </Table>
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

const ALink = styled('a')({
  color: '#1677ff',
  textDecoration: 'none',
  cursor: 'pointer',
  userSelect: 'none',
})

export default AccountManager
