import axios from 'utils/axios'
import qs from 'qs'
import { ItemsWorkspace, WorkspaceDataDTO } from 'store/slice/Workspace/WorkspaceType'

export type WorkspacePostDataDTO = { name: string; id?: number }

export const getWorkspacesApi = async (params: { [key: string]: number }): Promise<WorkspaceDataDTO> => {
  const paramsNew = qs.stringify(params, { indices: false })
  const response = await axios.get(`/workspaces?${paramsNew}`)
  return response.data
}

export const delWorkspaceApi = async (id: number): Promise<boolean> => {
  const response = await axios.delete(`/workspace/${id}`)
  return response.data
}

export const postWorkspaceApi = async (
  data: WorkspacePostDataDTO,
): Promise<ItemsWorkspace> => {
  const response = await axios.post(`/workspace`, data)
  return response.data
}

export const putWorkspaceApi = async (
  data: WorkspacePostDataDTO,
): Promise<ItemsWorkspace> => {
  const response = await axios.put(`/workspace/${data.id}`, { name: data.name })
  return response.data
}

export const importWorkspaceApi = async (
  data: Object,
): Promise<ItemsWorkspace> => {
  const response = await axios.post(`/workspace/import`, { todo_dummy: data })
  return response.data
}

export const exportWorkspaceApi = async (id: number): Promise<void> => {
  const response = await axios.get(`/workspace/export/${id}`)
  return response.data
}