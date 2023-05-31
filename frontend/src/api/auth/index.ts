import axios from 'components/utils/axios'
import { BASE_URL_DATABASE } from "../../const/API";

export const login = async (data: { email: string; password: string }) => {
  const response = await axios.post('/auth/login', data)
  return response.data
}

export const getMe = async () => {
  const response = await axios.get('/auth/me')
  return response.data
}

export const listUser = async (query?: object) => {
  const response = await axios.get('/admin/user', { params: query })
  return response.data
}

export const createUser = async (data: object) => {
  const response = await axios.post(`/admin/user`, data)
  return response.data
}

export const editUser = async (userId: string | number, data: object) => {
  const response = await axios.put(`/admin/user/${userId}`, data)
  return response.data
}

export const deleteUser = async (userId: string | number) => {
  const response = await axios.delete(`/admin/user/${userId}`)
  return response.data
}

export const deleteAccountProfile = async () => {
  const response = await axios.delete(`/auth/me`)
  return response.data
}

export const editNameProfile = async (data: object) => {
  const response = await axios.put(`/auth/me`, data)
  return response.data
}

export const editPassProfile = async (data: object) => {
  const response = await axios.put(`/auth/change-password`, data)
  return response.data
}

export const saveParams = async (data: object) => {
  const response = await axios.post(`/image_stat/param`, data)
  return response.data
}

export const loadParams = async () => {
  const response = await axios.get(`/image_stat/param`)
  return response.data
}

export const resetPassword = async (email: string) => {
  const response = await axios.post(`/admin/user/send_reset_password?email=${email}`, email)
  return response.data
}

export const getDataBaseTree = async () => {
  const response = await axios.get(`${BASE_URL_DATABASE}/rawdb/search`)
  return response.data
}

export const getDataBaseList = async () => {
  const response = await axios.get(`${BASE_URL_DATABASE}/rawdb/search/list`)
  return response.data
}

export const getRawdb = async (id: number) => {
  const response = await axios.get(`${BASE_URL_DATABASE}/rawdb/${id}`)
  return response.data
}

export const editAttributes = async (id: number, data: string) => {
  const response = await axios.put(`${BASE_URL_DATABASE}/rawdb/${id}`, data)
  return response.data
}
