import { createAsyncThunk } from '@reduxjs/toolkit'
import { PROJECT_SLICE_NAME, Project } from './ProjectType'
import { getProjectListApi } from 'api/project'

export const getProjectList = createAsyncThunk<Project, void>(
  `${PROJECT_SLICE_NAME}/getProjects`,
  async (_, thunkAPI) => {
    const { rejectWithValue } = thunkAPI
    try {
      const response = await getProjectListApi()
      return response
    } catch (e) {
      return rejectWithValue(e)
    }
  },
)
