import { createSlice } from '@reduxjs/toolkit'
import { PROJECT_SLICE_NAME, Dataset } from './DatasetType'
import { getDatasetList } from './DatasetAction'

const initialState: Dataset = {
  dataset: undefined,
  project_id: null,
}

export const datasetSlice = createSlice({
  name: PROJECT_SLICE_NAME,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getDatasetList.fulfilled, (state, action) => {
      state.dataset = action.payload.dataset
      state.project_id = action.payload.project_id
    })
  },
})

// eslint-disable-next-line no-empty-pattern
export const {} = datasetSlice.actions
export default datasetSlice.reducer
