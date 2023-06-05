import axios from 'components/utils/axios'
import { DATABASE_URL_HOST } from '../../const/API'
import { DatasetType } from 'store/slice/Dataset/DatasetType'

export const getDatasetListApi = async () => {
  const response = await axios.get(`${DATABASE_URL_HOST}/workdb/dataset/search`)
  return response.data
}

export const createDatasetApi = async (
  data: DatasetType[],
  project_id: number,
) => {
  const response = await axios.post(
    `${DATABASE_URL_HOST}/workdb/dataset/${project_id}`,
    data,
  )
  return response.data
}
