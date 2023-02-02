import { Box, Button, Modal, styled, Typography } from '@mui/material'
import InputPassword from 'components/InputPassword'
import { FC, useState } from 'react'

type ModalDeleteAccountProps = {
  onClose: () => void
  open: boolean
  onSubmit: () => void
}

const ModalChangePassword: FC<ModalDeleteAccountProps> = ({
  onClose,
  open,
  onSubmit,
}) => {
  const [errors, setError] = useState<{ [key: string]: string }>({})
  const [values, setValues] = useState<{ [key: string]: string }>({})

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <ContentDelete>
        <BoxTitle>
          <Typography sx={{ fontWeight: 600, fontSize: 18 }}>
            Change Password
          </Typography>
          <Typography style={{ fontSize: 13 }}>
            <span style={{ color: 'red' }}>*</span> is required
          </Typography>
        </BoxTitle>
        <BoxConfirm>
          <FormInline>
            <Label>
              Old password <span style={{ color: 'red' }}>*</span>
            </Label>
            <InputPassword error={errors.password} placeholder="Old Password" />
          </FormInline>
          <FormInline>
            <Label>
              New Password <span style={{ color: 'red' }}>*</span>
            </Label>
            <InputPassword
              error={errors.new_password}
              placeholder="New Password"
            />
          </FormInline>
          <FormInline>
            <Label>
              Confirm Password <span style={{ color: 'red' }}>*</span>
            </Label>
            <InputPassword
              error={errors.confirm_password}
              placeholder="Confirm Password"
            />
          </FormInline>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <ButtonConfirm onClick={onSubmit}>UPDATE</ButtonConfirm>
          </Box>
        </BoxConfirm>
        <Button onClick={onClose}>
          <Typography
            sx={{
              textDecoration: 'underline',
              textTransform: 'none',
              lineHeight: '17px',
            }}
          >
            Close
          </Typography>
        </Button>
      </ContentDelete>
    </Modal>
  )
}

const BoxTitle = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
})

const ContentDelete = styled(Box)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 450px;
  background-color: rgb(255, 255, 255);
  box-shadow: rgb(0 0 0 / 20%) 0px 11px 15px -7px,
    rgb(0 0 0 / 14%) 0px 24px 38px 3px, rgb(0 0 0 / 12%) 0px 9px 46px 8px;
  padding: 16px;
  border-radius: 4px;
  outline: none;
`

const BoxConfirm = styled(Box)({
  margin: '20px 0',
})

const FormInline = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: 10,
})

const Label = styled(Typography)({
  fontSize: 14,
  marginTop: 7,
})

const ButtonConfirm = styled(Button)({
  backgroundColor: '#283237 !important',
  height: 36,
  color: '#ffffff',
  marginTop: -1,
  width: 90,
})

export default ModalChangePassword
