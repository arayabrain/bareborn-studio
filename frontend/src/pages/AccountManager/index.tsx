import { Box, Button, SelectChangeEvent, styled } from '@mui/material'
import ModalDeleteAccount from 'components/ModalDeleteAccount'
import TableComponent, { Column } from 'components/Table'
import {
  ChangeEvent,
  FC,
  useCallback,
  useEffect,
  useMemo,
  useState,
  MouseEvent,
} from 'react'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import InputError from '../../components/common/InputError'
import SelectError from '../../components/common/SelectError'
import { createUser, deleteUser, editUser, listUser } from 'api/auth'
import { useUser } from 'providers'
import { DataProject } from 'pages/Projects'
import { isAdmin, optionsRole } from 'utils/auth'

type ModalComponentProps = {
  onSubmitEdit: (
    id: number | string | undefined,
    data: { [key: string]: string },
  ) => void
  setIsOpenModal: (v: boolean) => void
  dataEdit?: {
    [key: string]: string
  }
}

const initState = {
  email: '',
  password: '',
  role: '',
  lab: '',
  display_name: '',
  confirmPassword: '',
}

const ModalComponent: FC<ModalComponentProps> = ({
  onSubmitEdit,
  setIsOpenModal,
  dataEdit,
}) => {
  const regex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  const regexPassword = /^(?=.*\d)(?=.*[@$!%*#?&])(?=.*[a-zA-Z]).{6,255}$/
  const [formData, setFormData] = useState<{ [key: string]: string }>(
    dataEdit || initState,
  )
  const [isDisabled, setIsDisabled] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>(initState)
  const [values, setValues] = useState<{ [key: string]: string }>(
    dataEdit || initState,
  )
  const validateEmail = (value: string): string => {
    const error = validateField('email', 255, value)
    if (error) return error
    if (!regex.test(value)) {
      return 'Invalid email format'
    }
    return ''
  }

  const validatePassword = (value: string, isConfirm?: boolean): string => {
    if (!value && !dataEdit?.uid) return 'This field is required'
    const errorLength = validateLength('password', 255, value)
    if (errorLength) {
      return errorLength
    }
    if (!regexPassword.test(value)) {
      return 'Your password must be at least 6 characters long and must contain at least one letter, number, and special character'
    }
    if (isConfirm && formData.password !== formData.confirmPassword) {
      return 'password is not match'
    }
    return ''
  }

  const validateField = (name: string, length: number, value?: string) => {
    if (!formData[name] && !value) return 'This field is required'
    return validateLength(name, length, value)
  }

  const validateLength = (name: string, length: number, value?: string) => {
    if(value && value.length > length) return `The text may not be longer than ${length} characters`
    if (formData[name]?.length && value && value.length > length) {
      return `The text may not be longer than ${length} characters`
    }
    return ''
  }

  const validateForm = (): { [key: string]: string } => {
    const errorName = validateField('display_name', 100)
    const errorEmail = validateEmail(values.email)
    const errorLab = validateField('lab', 100)
    const errorRole = validateField('role', 50)
    const errorPassword = validatePassword(values.password)
    const errorConfirmPassword = validatePassword(values.confirmPassword, true)
    return {
      email: errorEmail,
      password: errorPassword,
      confirmPassword: errorConfirmPassword,
      display_name: errorName,
      lab: errorLab,
      role: errorRole,
    }
  }

  const onChangeData = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement> | SelectChangeEvent,
    type: string,
    length: number,
  ) => {
    setFormData({ ...formData, [type]: e.target.value })
    const { value } = e.target
    const error = validateField(e.target.name, length, value)
    setValues((pre) => ({ ...pre, [type]: value }))
    setErrors({ ...errors, [e.target.name]: error })
  }

  const onBlurData = useCallback(
    (
      e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
      type: string,
      validate?: Function,
    ) => {
      const { value } = e.target
      setValues((pre) => ({ ...pre, [type]: value }))
      setErrors((pre) => ({
        ...pre,
        [type]: validate?.(value),
      }))
    },
    [],
  )

  const onSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setIsDisabled(true)
    const newErrors = validateForm()
    if (Object.keys(newErrors).some((key) => !!newErrors[key])) {
      setErrors(newErrors)
      setIsDisabled(false)
      return
    }
    try {
      await onSubmitEdit(dataEdit?.uid, formData)
      if (!dataEdit?.uid) {
        alert('Your account has been created successfully!')
      }
    } catch {
      if (!dataEdit?.uid) {
        alert('This email already exists')
      }
    }
    setIsOpenModal(false)
  }
  const onCancel = () => {
    setIsOpenModal(false)
  }
  return (
    <Modal>
      <ModalBox>
        <TitleModal>{dataEdit?.uid ? 'Edit' : 'Add'} Account</TitleModal>
        <BoxData>
          <LabelModal>Lab: </LabelModal>
          <InputError
            name="lab"
            value={formData?.lab || ''}
            onChange={(e) => onChangeData(e, 'lab', 100)}
            onBlur={(e) => onBlurData(e, 'lab')}
            errorMessage={errors.lab}
          />
          <LabelModal>Name: </LabelModal>
          <InputError
            name="display_name"
            value={formData?.display_name || ''}
            onChange={(e) => onChangeData(e, 'display_name', 100)}
            onBlur={(e) => onBlurData(e, 'display_name')}
            errorMessage={errors.display_name}
          />
          <LabelModal>Role: </LabelModal>
          <SelectError
            value={formData?.role || ''}
            options={optionsRole}
            onChange={(e) => onChangeData(e, 'role', 50)}
            onBlur={(e) => onBlurData(e, 'role')}
            errorMessage={errors.role}
          />
          <LabelModal>e-mail: </LabelModal>
          <InputError
            name="email"
            value={formData?.email || ''}
            onChange={(e) => onChangeData(e, 'email', 255)}
            onBlur={(e) => onBlurData(e, 'email', validateEmail)}
            errorMessage={errors.email}
          />
          {!dataEdit?.uid ? (
            <>
              <LabelModal>Password: </LabelModal>
              <InputError
                name="password"
                value={formData?.password || ''}
                onChange={(e) => onChangeData(e, 'password', 255)}
                onBlur={(e) => onBlurData(e, 'password', validatePassword)}
                type={'password'}
                errorMessage={errors.password}
              />
              <LabelModal>Confirm Password: </LabelModal>
              <InputError
                name="confirmPassword"
                value={formData?.confirmPassword || ''}
                onChange={(e) => onChangeData(e, 'confirmPassword', 255)}
                onBlur={(e) =>
                  onBlurData(e, 'confirmPassword', validatePassword)
                }
                type={'password'}
                errorMessage={errors.confirmPassword}
              />
            </>
          ) : null}
        </BoxData>
        <ButtonModal>
          <Button disabled={isDisabled} onClick={(e) => onSubmit(e)}>
            Ok
          </Button>
          <Button onClick={() => onCancel()}>Cancel</Button>
        </ButtonModal>
      </ModalBox>
    </Modal>
  )
}
const AccountManager = () => {
  const [openDelete, setOpenDelete] = useState(false)
  const [isOpenModal, setIsOpenModal] = useState(false)
  const [dataEdit, setDataEdit] = useState({})
  const [idDel, setIdDel] = useState<string | undefined>()
  const [data, setData] = useState<any[]>([])
  const [paginate, setPaginate] = useState({
    total: 0,
    per_page: 10,
    page: -1,
    next_page_token: [],
  })
  const { user } = useUser()

  useEffect(() => {
    getList()
    //eslint-disable-next-line
  }, [])

  const getList = async (page: number = 0) => {
    const query: { [key: string]: string | number } = {
      offset: paginate.per_page * page,
    }
    if (paginate.next_page_token[page - 1]) {
      query.next_page_token = paginate.next_page_token[page - 1]
    }
    const data = await listUser(query)
    const nextPageToken: string[] = paginate.next_page_token
    if (page > paginate.page) {
      nextPageToken.push(data.next_page_token)
    }
    setData(data.data)
    setPaginate((pre) => ({
      ...pre,
      total: data.total_page * paginate.per_page,
      next_page_token: nextPageToken as any,
      page,
    }))
  }

  const onOpenModal = () => {
    setIsOpenModal(true)
  }

  const handleCloseDelete = () => {
    setOpenDelete(false)
  }

  const onConfirmDelete = (id: string | number) => {
    setIdDel(String(id))
    setOpenDelete(true)
  }

  const onForgotPassword = (data: DataProject) => {
    //todo call api
    setDataEdit(data)
    setIsOpenModal(true)
  }

  const onDelete = () => {
    if (idDel === undefined) return
    deleteUser(idDel).then(() => {
      handleCloseDelete()
      setIdDel(undefined)
      setOpenDelete(false)
      getList()
    })
  }

  const onSubmitEdit = async (
    id: number | string | undefined,
    data: { [key: string]: string },
  ) => {
    if (id !== undefined) {
      await editUser(id, data)
    } else {
      await createUser(data)
    }
    await getList(id !== undefined ? paginate.page : 0)
    return undefined
  }

  const columns = useMemo(
    (): Column[] => [
      { title: 'Lab', name: 'lab' },
      { title: 'Name', name: 'display_name' },
      { title: 'Role', name: 'role' },
      { title: 'Mail', name: 'email' },
      {
        title: '',
        name: 'action',
        width: 185,
        render: (data) => {
          if (data.id === user?.uid) return null
          return (
            <>
              <ALink
                sx={{ color: 'red' }}
                onClick={() => onForgotPassword(data)}
              >
                <EditIcon sx={{ color: 'black' }} />
              </ALink>
              <ALink sx={{ ml: 1.25 }} onClick={() => onConfirmDelete(data.id)}>
                <DeleteIcon sx={{ color: 'red' }} />
              </ALink>
            </>
          )
        },
      },
    ],
    [user?.uid],
  )

  if (!isAdmin(user?.role)) {
    return null
  }

  return (
    <AccountManagerWrapper>
      <h1 style={{ paddingLeft: 16 }}>Account Manager</h1>
      <ModalDeleteAccount
        titleSubmit="Delete Account"
        onClose={handleCloseDelete}
        open={openDelete}
        onSubmit={onDelete}
      />
      <BoxButton>
        <ButtonAdd onClick={() => onOpenModal()} variant="contained">
          Add
        </ButtonAdd>
      </BoxButton>
      <TableComponent
        paginate={{
          total: paginate.total,
          page: paginate.page,
          page_size: paginate.per_page,
          onPageChange: ({ selected }) => {
            getList(selected)
          },
        }}
        data={data}
        columns={columns}
      />
      {isOpenModal ? (
        <ModalComponent
          onSubmitEdit={onSubmitEdit}
          setIsOpenModal={(flag) => {
            setIsOpenModal(flag)
            if (!flag) {
              setDataEdit({})
            }
          }}
          dataEdit={dataEdit}
        />
      ) : null}
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
  backgroundColor: '#283237 !important',
  color: '#ffffff',
}))

const ALink = styled('a')({
  color: '#1677ff',
  textDecoration: 'none',
  cursor: 'pointer',
  userSelect: 'none',
})

const Modal = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#cccccc80',
}))

const ModalBox = styled(Box)(({ theme }) => ({
  width: 800,
  height: 550,
  backgroundColor: 'white',
  border: '1px solid black',
}))

const TitleModal = styled(Box)(({ theme }) => ({
  fontSize: 25,
  margin: theme.spacing(5),
}))

const BoxData = styled(Box)(({ theme }) => ({
  marginTop: 35,
}))

const LabelModal = styled(Box)(({ theme }) => ({
  width: 300,
  display: 'inline-block',
  textAlign: 'end',
  marginRight: theme.spacing(0.5),
}))

const ButtonModal = styled(Box)(({ theme }) => ({
  button: {
    fontSize: 20,
  },
  display: 'flex',
  justifyContent: 'end',
  margin: theme.spacing(5),
}))

export default AccountManager
