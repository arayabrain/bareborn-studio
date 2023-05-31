import axios from 'components/utils/axios'
import { BASE_URL_DATABASE } from '../../const/API'

export const getDatasetListApi = async () => {
  const response = await axios.get(`${BASE_URL_DATABASE}/workdb/dataset/search`)
  return response.data
}
