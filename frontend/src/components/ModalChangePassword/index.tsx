import { Box, Button, Modal, styled, Typography } from '@mui/material'
import InputPassword from 'components/InputPassword'
import { ChangeEvent, FC, useState } from 'react'

type ModalDeleteAccountProps = {
  onClose: () => void
  open: boolean
  onSubmit: () => void
}

const regexPassword = /^(?=.*\d)(?=.*[@$!%*#?&])(?=.*[a-zA-Z]).{6,100}$/

const ModalChangePassword: FC<ModalDeleteAccountProps> = ({
  onClose,
  open,
  onSubmit,
}) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [values, setValues] = useState<{ [key: string]: string }>({})

  const onChangeValue = (
    event: ChangeEvent<HTMLInputElement>,
    validate?: Function,
  ) => {
    const { name, value } = event.target
    setValues({ ...values, [name]: value })
    setErrors({ ...errors, [name]: validate?.(value) })
  }

  const validatePassword = (value: string): string => {
    if (!value) return 'This field is required'
    if (!regexPassword.test(value)) {
      return 'Your password must be at least 6 characters long and must contain at least one letter, number, and special character'
    }
    return ''
  }

  const validateReEnter = (value: string): string => {
    if (!value) return 'This field is required'
    if (value !== values.password) {
      return 'Passwords do not match'
    }
    return ''
  }

  const validateReEnterWhenInputPassword = () => {
    const { reEnter, password } = values
    if (reEnter && reEnter !== password) {
      setErrors((pre) => ({ ...pre, reEnter: 'Passwords do not match' }))
    }
  }

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
            <InputPassword
              onChange={(e: any) => onChangeValue(e, validatePassword)}
              name="password"
              error={errors.password}
              placeholder="Old Password"
            />
          </FormInline>
          <FormInline>
            <Label>
              New Password <span style={{ color: 'red' }}>*</span>
            </Label>
            <InputPassword
              onChange={(e: any) => onChangeValue(e, validatePassword)}
              name="new_password"
              error={errors.new_password}
              placeholder="New Password"
              onBlur={validateReEnterWhenInputPassword}
            />
          </FormInline>
          <FormInline>
            <Label>
              Confirm Password <span style={{ color: 'red' }}>*</span>
            </Label>
            <InputPassword
              onChange={(e: any) => onChangeValue(e, validateReEnter)}
              name="confirm_password"
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
  width: '100%',
})

const ButtonConfirm = styled(Button)({
  backgroundColor: '#283237 !important',
  height: 36,
  color: '#ffffff',
  marginTop: -1,
  width: 90,
})

export default ModalChangePassword
