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

type ModalComponentProps = {
  onSubmitEdit: (id: number | string, data: { [key: string]: string }) => void
  setIsOpenModal: (v: boolean) => void
  type: string
  dataEdit: {
    [key: string]: string
  }
}

const ModalComponent: FC<ModalComponentProps> = ({
  onSubmitEdit,
  setIsOpenModal,
  type,
  dataEdit,
}: any) => {
  const regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  const regexPassword = /^(?=.*\d)(?=.*[@$!%*#?&])(?=.*[a-zA-Z]).{6,255}$/
  const [formData, setFormData] = useState(type !== 'Add' ? dataEdit : {})
  const [isDisabled, setIsDisabled] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({
    email: '',
    password: '',
    role: '',
    lab: '',
    display_name: '',
    confirmPassword: '',
  })
  const [values, setValues] = useState<{ [key: string]: string }>(
    dataEdit || {
      email: '',
      password: '',
      role: '',
      lab: '',
      display_name: '',
      confirmPassword: '',
    },
  )
  const validateEmail = (value: string): string => {
    if (!value) return 'This field is required'
    if(value.length > 255) return 'max length 255'
    if (!regex.test(value)) {
      return 'Invalid email format'
    }
    return ''
  }

  const validatePassword = (value: string): string => {
    if (!value) return ''
    if (!regexPassword.test(value)) {
      return 'Your password must be at least 6 characters long and must contain at least one letter, number, and special character'
    }
    return ''
  }

  const onChangeData = useCallback(
    (
      e:
        | ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
        | SelectChangeEvent,
      type: string,
    ) => {
      setFormData({ ...formData, [type]: e.target.value })
      const { value } = e.target
      setValues((pre) => ({ ...pre, [type]: value }))
    },
    [formData],
  )
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
        [type]: value === '' ? 'This field is required' : validate?.(value),
      }))
    },
    [],
  )

  const onSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setIsDisabled(true)
    const errorName =
      values.display_name === '' || !formData.hasOwnProperty('display_name')
        ? 'This field is required'
        : values.display_name.length > 100 ? 'max length 100' : ''
    const errorEmail = validateEmail(values.email)
    const errorLab =
      values.lab === '' || !formData.hasOwnProperty('lab')
        ? 'This field is required'
        : values.lab.length > 100 ? 'max length 100' : ''
    const errorRole = values.role === '' || !formData.hasOwnProperty('role')
        ? 'This field is required'
        : values.role.length > 50 ? 'max length 50' : ''
    const errorPassword = values.password === '' ? 'This field is required' : values.password?.length > 255 ? 'max length 255' : validatePassword(values.password)
    const errorConfirmPassword = !values.password && !values.confirmPassword && type === 'Add' ? 'This field is required' : validatePassword(values.confirmPassword)
    const errorNotMatch =
      formData.password === formData.confirmPassword
        ? ''
        : 'password is not match'
    if (
      errorEmail ||
      errorPassword ||
      errorConfirmPassword ||
      errorNotMatch ||
      errorName ||
      errorRole ||
      errorLab
    ) {
      setErrors({
        email: errorEmail,
        password: errorPassword,
        confirmPassword:
          errorConfirmPassword === '' ? errorNotMatch : errorConfirmPassword,
        display_name: errorName,
        lab: errorLab,
        role: errorRole,
      })
      setIsDisabled(false)
      return
    }
    try {
      await onSubmitEdit(dataEdit.uid, formData)
      setIsDisabled(false)
      if (type === 'Add') {
        alert('Your account has been created successfully!')
      }
    } catch {
      setIsDisabled(false)
      if (type === 'Add') {
        alert('Your account creation failed!')
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
        <TitleModal>{type} Account</TitleModal>
        <BoxData>
          <LabelModal>Lab: </LabelModal>
          <InputError
            value={formData?.lab || ''}
            onChange={(e) => onChangeData(e, 'lab')}
            onBlur={(e) => onBlurData(e, 'lab')}
            errorMessage={errors.lab}
          />
          <LabelModal>Name: </LabelModal>
          <InputError
            value={formData?.display_name || ''}
            onChange={(e) => onChangeData(e, 'display_name')}
            onBlur={(e) => onBlurData(e, 'display_name')}
            errorMessage={errors.display_name}
          />
          <LabelModal>Role: </LabelModal>
          <SelectError
            value={formData?.role || ''}
            options={['ADMIN', 'RESEARCHER', 'MANAGER']}
            onChange={(e) => onChangeData(e, 'role')}
            onBlur={(e) => onBlurData(e, 'role')}
            errorMessage={errors.role}
          />
          <LabelModal>e-mail: </LabelModal>
          <InputError
            value={formData?.email || ''}
            onChange={(e) => onChangeData(e, 'email')}
            onBlur={(e) => onBlurData(e, 'email', validateEmail)}
            errorMessage={errors.email}
          />
          {type === 'Add' ? (
            <>
              <LabelModal>Password: </LabelModal>
              <InputError
                value={formData?.password || ''}
                onChange={(e) => onChangeData(e, 'password')}
                onBlur={(e) => onBlurData(e, 'password', validatePassword)}
                type={'password'}
                errorMessage={errors.password}
              />
              <LabelModal>Confirm Password: </LabelModal>
              <InputError
                value={formData?.confirmPassword || ''}
                onChange={(e) => onChangeData(e, 'confirmPassword')}
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
  const [type, setType] = useState<string>('')
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

  const onOpenModal = (type: string) => {
    setIsOpenModal(true)
    setType(type)
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
    setType('Edit')
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
    id: number | string,
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
              <ALink
                sx={{ ml: 1.25 }}
                onClick={() => onConfirmDelete(data.id)}
              >
                <DeleteIcon sx={{ color: 'red' }} />
              </ALink>
            </>
          )
        },
      },
    ],
    [user?.uid],
  )

  if (user?.role !== 'ADMIN') {
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
        <ButtonAdd onClick={() => onOpenModal('Add')} variant="contained">
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
          type={type}
          setIsOpenModal={setIsOpenModal}
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
