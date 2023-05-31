import axios from 'components/utils/axios'
import { BASE_URL_DATABASE } from '../../const/API'

export const getProjectListApi = async () => {
  const response = await axios.get(`${BASE_URL_DATABASE}/workdb/projects/search`)
  return response.data
}
