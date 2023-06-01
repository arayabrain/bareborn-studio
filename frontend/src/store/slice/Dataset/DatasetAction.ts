import { createAsyncThunk } from '@reduxjs/toolkit'
import { PROJECT_SLICE_NAME, Dataset, DatasetType } from './DatasetType'
import { createDatasetApi, getDatasetListApi } from 'api/dataset'

export const getDatasetList = createAsyncThunk<Dataset, void>(
  `${PROJECT_SLICE_NAME}/getDatasets`,
  async (_, thunkAPI) => {
    const { rejectWithValue } = thunkAPI
    try {
      const response = await getDatasetListApi()
      return response
    } catch (e) {
      return rejectWithValue(e)
    }
  },
)

export const createDataset = createAsyncThunk<
  Dataset,
  {
    dataset: DatasetType[]
    project_id: number
    callback?: (isSuccess: boolean) => void
  }
>(`${PROJECT_SLICE_NAME}/createDataset`, async (param, thunkAPI) => {
  const { rejectWithValue } = thunkAPI
  try {
    const response = await createDatasetApi(param.dataset, param.project_id)
    param.callback?.(true)
    return response
  } catch (e) {
    param.callback?.(false)
    return rejectWithValue(e)
  }
})
