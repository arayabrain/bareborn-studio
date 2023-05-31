import { createSlice } from '@reduxjs/toolkit'
import { PROJECT_SLICE_NAME, Dataset } from './DatasetType'
import { getDatasetList } from './DatasetAction'

const initialState: Dataset = {
  datasets: [],
}

export const datasetSlice = createSlice({
  name: PROJECT_SLICE_NAME,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getDatasetList.fulfilled, (state, action) => {
      console.log('action.payload.datasets', action.payload.datasets)
      state.datasets = action.payload.datasets
    })
  },
})

export const {} = datasetSlice.actions
export default datasetSlice.reducer
