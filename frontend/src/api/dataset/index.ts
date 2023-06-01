import axios from 'components/utils/axios'
import { BASE_URL_DATABASE } from '../../const/API'
import { DatasetType } from 'store/slice/Dataset/DatasetType'

export const getDatasetListApi = async () => {
  const response = await axios.get(`${BASE_URL_DATABASE}/workdb/dataset/search`)
  return response.data
}

export const createDatasetApi = async (
  data: DatasetType[],
  project_id: number,
) => {
  const response = await axios.post(
    `${BASE_URL_DATABASE}/workdb/dataset/${project_id}`,
    data,
  )
  return response.data
}
