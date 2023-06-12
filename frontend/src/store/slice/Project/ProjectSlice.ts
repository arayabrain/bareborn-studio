import { createSlice } from '@reduxjs/toolkit'
import { PROJECT_SLICE_NAME, Project } from './ProjectType'
import { getProjectList, getProjectId } from './ProjectAction'

const initialState: Project = {
  projects: [],
  currentProject: undefined,
}

export const projectSlice = createSlice({
  name: PROJECT_SLICE_NAME,
  initialState,
  reducers: {
    resetCurrentProject: (state) => {
      state.currentProject = undefined
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getProjectList.fulfilled, (state, action) => {
      state.projects = action.payload.projects
    })
    builder.addCase(getProjectId.fulfilled, (state, action) => {
      state.currentProject = action.payload
    })
  },
})

export const { resetCurrentProject } = projectSlice.actions
export default projectSlice.reducer
