import axios from "components/utils/axios";
import {BASE_URL_DATABASE} from "const/API";

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