import axios from 'components/utils/axios'
import { DATABASE_URL_HOST } from '../../const/API'
import { ProjectCreate } from 'store/slice/Project/ProjectType'

export const getProjectListApi = async () => {
  const response = await axios.get(
    `${DATABASE_URL_HOST}/workdb/projects/search`,
  )
  return response.data
}

export const createProjectApi = async (data: ProjectCreate) => {
  const response = await axios.post(`${DATABASE_URL_HOST}/workdb/project`, data)
  return response.data
}

export const deleteProjectApi = async (project_id: number) => {
  const response = await axios.delete(
    `${DATABASE_URL_HOST}/workdb/project/${project_id}`,
  )
  return response.data
}
