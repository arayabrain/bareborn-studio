import { AsyncThunk, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'

import { ThunkApiConfig } from 'store/store'
import { DataPipeLine, PIPELINE_SLICE_NAME } from './PipelineType'
import {
  runApi,
  runByUidApi,
  runResult,
  RunResultDTO,
  RunPostData,
} from 'api/run/Run'
import {
  selectPipelineLatestUid,
  selectRunResultPendingNodeIdList,
} from './PipelineSelectors'
import { selectCurrentProjectId } from '../Dataset/DatasetSelector'
import { Dataset, SubFolder } from '../Dataset/DatasetType'
import { ExperimentDTO } from 'api/experiments/Experiments'
import { getDatasetList } from '../Dataset/DatasetAction'
import {
  fetchExperiment,
  importExperimentByUid,
} from '../Experiments/ExperimentsActions'

export const run = createAsyncThunk<
  string,
  { runPostData: RunPostData },
  ThunkApiConfig
>(`${PIPELINE_SLICE_NAME}/run`, async ({ runPostData }, thunkAPI) => {
  const projectId = selectCurrentProjectId(thunkAPI.getState())
  if (projectId) {
    try {
      const responseData = await runApi(projectId, runPostData)
      return responseData
    } catch (e) {
      return thunkAPI.rejectWithValue(e)
    }
  } else {
    return thunkAPI.rejectWithValue('projectId does not exist.')
  }
})

export const runByCurrentUid = createAsyncThunk<
  string,
  { runPostData: Omit<RunPostData, 'name'> },
  ThunkApiConfig
>(
  `${PIPELINE_SLICE_NAME}/runByCurrentUid`,
  async ({ runPostData }, thunkAPI) => {
    const projectId = selectCurrentProjectId(thunkAPI.getState())
    const currentUid = selectPipelineLatestUid(thunkAPI.getState())
    if (projectId && currentUid != null) {
      try {
        const responseData = await runByUidApi(
          projectId,
          currentUid,
          runPostData,
        )
        return responseData
      } catch (e) {
        return thunkAPI.rejectWithValue(e)
      }
    } else {
      return thunkAPI.rejectWithValue('projectId or currentUid dose not exist.')
    }
  },
)

export const pollRunResult = createAsyncThunk<
  RunResultDTO,
  {
    uid: string
  },
  ThunkApiConfig
>(`${PIPELINE_SLICE_NAME}/pollRunResult`, async ({ uid }, thunkAPI) => {
  const projectId = selectCurrentProjectId(thunkAPI.getState())
  const pendingNodeIdList = selectRunResultPendingNodeIdList(
    thunkAPI.getState(),
  )
  if (projectId) {
    try {
      const responseData = await runResult({
        projectId,
        uid,
        pendingNodeIdList,
      })
      return responseData
    } catch (e) {
      return thunkAPI.rejectWithValue(e)
    }
  } else {
    return thunkAPI.rejectWithValue('projectId does not exist.')
  }
})

export const getDataPipeLine: AsyncThunk<
  DataPipeLine,
  {
    projectId: string
    isEdited: boolean
  },
  ThunkApiConfig
> = createAsyncThunk<
  DataPipeLine,
  { projectId: string; isEdited: boolean },
  ThunkApiConfig
>(
  `${PIPELINE_SLICE_NAME}/getDataPipeLine`,
  async ({ isEdited, projectId }, thunkAPI) => {
    const promises: Promise<
      | PayloadAction<
          Dataset | unknown,
          string,
          {
            arg: { project_id: string }
            requestId: string
            requestStatus: 'fulfilled' | 'rejected'
          },
          never
        >
      | PayloadAction<
          RunPostData | unknown,
          string,
          {
            arg: string
            requestId: string
            requestStatus: 'fulfilled' | 'rejected'
          },
          never
        >
      | ExperimentDTO
      | undefined
    >[] = [thunkAPI.dispatch(getDatasetList({ project_id: projectId }))]
    if (!isEdited) {
      promises.push(
        thunkAPI
          .dispatch(fetchExperiment(String(projectId)))
          .unwrap()
          .catch(() => thunkAPI.dispatch(importExperimentByUid('default'))),
      )
    }
    try {
      const [dataset, experiment] = await Promise.all(promises)
      return {
        dataset: (dataset as PayloadAction<Dataset>).payload
          .dataset as SubFolder,
        experiment: experiment as ExperimentDTO | undefined,
      }
    } catch (e) {
      return thunkAPI.rejectWithValue(e)
    }
  },
)
