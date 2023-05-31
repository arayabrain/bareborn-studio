import { createAsyncThunk } from '@reduxjs/toolkit'
import { PROJECT_SLICE_NAME, Dataset } from './DatasetType'
import { getDatasetListApi } from 'api/dataset'

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
