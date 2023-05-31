import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { PROJECT_SLICE_NAME, Project } from './ProjectType'
import { getProjectList } from './ProjectAction'

const initialState: Project = {
  projects: [],
  currentProject: {},
}

export const projectSlice = createSlice({
  name: PROJECT_SLICE_NAME,
  initialState,
  reducers: {
    deleteProject: (
      state,
      action: PayloadAction<string | number | undefined>,
    ) => {
      state.projects = state.projects.filter(
        (project) => project.id !== action.payload,
      )
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getProjectList.fulfilled, (state, action) => {
      state.projects = action.payload.projects
    })
  },
})

export const { deleteProject } = projectSlice.actions
export default projectSlice.reducer
