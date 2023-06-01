import axios from 'components/utils/axios'
import { BASE_URL_DATABASE } from '../../const/API'
import { ProjectCreate } from 'store/slice/Project/ProjectType'

export const getProjectListApi = async () => {
  const response = await axios.get(
    `${BASE_URL_DATABASE}/workdb/projects/search`,
  )
  return response.data
}

export const createProjectApi = async (data: ProjectCreate) => {
  const response = await axios.post(`${BASE_URL_DATABASE}/workdb/project`, data)
  return response.data
}

export const deleteProjectApi = async (project_id: number) => {
  const response = await axios.delete(`${BASE_URL_DATABASE}/workdb/project/${project_id}`, )
  return response.data
}
