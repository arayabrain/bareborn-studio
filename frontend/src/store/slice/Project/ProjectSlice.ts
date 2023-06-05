import { createSlice } from '@reduxjs/toolkit'
import { PROJECT_SLICE_NAME, Project } from './ProjectType'
import { getProjectList } from './ProjectAction'

const initialState: Project = {
  projects: [],
  currentProject: {},
}

export const projectSlice = createSlice({
  name: PROJECT_SLICE_NAME,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getProjectList.fulfilled, (state, action) => {
      state.projects = action.payload.projects
    })
  },
})

// eslint-disable-next-line no-empty-pattern
export const {} = projectSlice.actions
export default projectSlice.reducer
