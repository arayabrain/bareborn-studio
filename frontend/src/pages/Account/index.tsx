import { Box, Button, styled, Typography } from '@mui/material'
import { Input } from 'components/common/Input'
import ModalChangePassword from 'components/ModalChangePassword'
import ModalDeleteAccount from 'components/ModalDeleteAccount'
import { useUser } from 'providers'
import { useState } from 'react'
import {optionsRole} from "../../utils/auth";

const Account = () => {
  const { user } = useUser()
  const [isEditName, setIsEditName] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [openChangePw, setOpenChangePw] = useState(false)

  const onEditName = () => {
    setIsEditName(false)
  }

  const handleCloseDelete = () => {
    setOpenDelete(false)
  }

  const onConfirmDelete = () => {
    setOpenDelete(true)
  }

  const onDelete = () => {
    //todo call api
    handleCloseDelete()
  }

  const handleCloseChangePw = () => {
    setOpenChangePw(false)
  }

  const onConfirmChangePw = () => {
    setOpenChangePw(true)
  }

  const onChangePw = () => {
    //todo call api
    handleCloseChangePw()
  }

  return (
    <AccountWrapper>
      <ModalDeleteAccount
        titleSubmit="Delete My Account"
        onClose={handleCloseDelete}
        open={openDelete}
        onSubmit={onDelete}
      />
      <ModalChangePassword
        onSubmit={onChangePw}
        open={openChangePw}
        onClose={handleCloseChangePw}
      />
      <Title>Account Profile</Title>
      <BoxFlex>
        <TitleData>Account ID</TitleData>
        <BoxData>{user?.uid}</BoxData>
      </BoxFlex>
      <BoxFlex>
        <TitleData sx={{ marginTop: isEditName ? -2 : 0 }}>Full name</TitleData>
        <BoxData>
          {isEditName ? (
            <Input
              autoFocus
              defaultValue={user?.display_name || ''}
              onBlur={onEditName}
              placeholder="Full name"
            />
          ) : (
            <>
              {user?.display_name || "--"}
              <Button sx={{ ml: 1 }} onClick={() => setIsEditName(true)}>
                Edit
              </Button>
            </>
          )}
        </BoxData>
      </BoxFlex>
      <BoxFlex>
        <TitleData>Email</TitleData>
        <BoxData>{user?.email}</BoxData>
      </BoxFlex>
      <BoxFlex>
        <TitleData>Role</TitleData>
        <BoxData>{optionsRole.find(role => String(role.code) === String(user?.role))?.name}</BoxData>
      </BoxFlex>
      <BoxFlex sx={{ justifyContent: 'space-between', mt: 10 }}>
        <ButtonSubmit onClick={onConfirmChangePw}>Change Password</ButtonSubmit>
        <ButtonSubmit onClick={onConfirmDelete}>Delete Account</ButtonSubmit>
      </BoxFlex>
    </AccountWrapper>
  )
}

const AccountWrapper = styled(Box)({
  padding: '0 20px',
})

const BoxFlex = styled(Box)({
  display: 'flex',
  margin: '20px 0 10px 0',
  alignItems: 'center',
  maxWidth: 1000,
})

const Title = styled('h2')({
  marginBottom: 40,
})

const BoxData = styled(Typography)({
  fontWeight: 700,
  minWidth: 272,
})

const TitleData = styled(Typography)({
  width: 250,
})

const ButtonSubmit = styled('button')({
  backgroundColor: '#283237',
  color: '#ffffff',
  borderRadius: 4,
  border: 'none',
  outline: 'none',
  padding: '10px 20px',
  cursor: 'pointer',
})

export default Account
