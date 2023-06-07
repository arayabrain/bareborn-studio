import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom'
import { AppDispatch } from 'store/store'

import { selectRunPostData } from 'store/selectors/run/RunSelectors'
import {
  selectPipelineIsCanceled,
  selectPipelineIsStartedSuccess,
  selectPipelineLatestUid,
  selectPipelineStatus,
} from './PipelineSelectors'
import { run, pollRunResult, runByCurrentUid } from './PipelineActions'
import { cancelPipeline } from './PipelineSlice'
import { selectFilePathIsUndefined } from '../InputNode/InputNodeSelectors'
import { selectAlgorithmNodeNotExist } from '../AlgorithmNode/AlgorithmNodeSelectors'
import { useSnackbar } from 'notistack'
import { RUN_STATUS } from './PipelineType'
import {
  fetchExperiment,
  getExperiments,
  importExperimentByUid,
} from '../Experiments/ExperimentsActions'
import { getDatasetList } from '../Dataset/DatasetAction'
import { reset } from '../Dataset/DatasetSlice'
import { getUrlFromSubfolder } from '../Dataset/DatasetSelector'
import { AsyncThunkAction } from '@reduxjs/toolkit'
import { Dataset } from '../Dataset/DatasetType'
import { ExperimentDTO } from 'api/experiments/Experiments'
import { setInputNodeFilePath } from '../InputNode/InputNodeActions'
import { initialElements } from '../FlowElement/FlowElementSlice'

const POLLING_INTERVAL = 5000

export type UseRunPipelineReturnType = ReturnType<typeof useRunPipeline>

type DataActionThunk = {
  payload: Dataset
  error?: { message: string }
}

export function useRunPipeline() {
  const dispatch = useDispatch()
  const appDispatch: AppDispatch = useDispatch()
  const uid = useSelector(selectPipelineLatestUid)
  const isCanceled = useSelector(selectPipelineIsCanceled)
  const isStartedSuccess = useSelector(selectPipelineIsStartedSuccess)
  const filePathIsUndefined = useSelector(selectFilePathIsUndefined)
  const algorithmNodeNotExist = useSelector(selectAlgorithmNodeNotExist)
  const runPostData = useSelector(selectRunPostData)
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get('id')
  const navigate = useNavigate()

  const handleRunPipeline = React.useCallback(
    (name: string) => {
      dispatch(run({ runPostData: { name, ...runPostData, forceRunList: [] } }))
    },
    [dispatch, runPostData],
  )
  const handleRunPipelineByUid = React.useCallback(() => {
    dispatch(runByCurrentUid({ runPostData }))
  }, [dispatch, runPostData])
  const location = useLocation()
  const [isEdited] = useState<{ edited: boolean }>(
    location.state as { edited: boolean },
  )
  React.useEffect(() => {
    getData().then()
    //eslint-disable-next-line
  }, [])
  React.useEffect(() => {
    if (!projectId) {
      navigate('/projects')
      return
    }
    return () => {
      dispatch(reset())
    }
    //eslint-disable-next-line
  }, [])

  const getData = async () => {
    if (!projectId) return
    const promises: AsyncThunkAction<
      Dataset | ExperimentDTO,
      | {
          project_id: string
        }
      | string,
      {}
    >[] = [dispatch(getDatasetList({ project_id: projectId }))]
    if (!isEdited) {
      promises.push(
        appDispatch(fetchExperiment(String(projectId)))
          .unwrap()
          .catch((_) => dispatch(importExperimentByUid('default'))) as any,
      )
    }
    const [dataset, experiment] = await Promise.all(promises)
    let urls: string[] = []
    getUrlFromSubfolder(
      (dataset as unknown as DataActionThunk).payload.dataset?.sub_folders,
      urls,
    )
    if ((experiment as unknown as DataActionThunk)?.error) {
      dispatch(
        setInputNodeFilePath({
          nodeId: initialElements[0].id,
          filePath: urls,
        }),
      )
    }
  }

  const handleCancelPipeline = React.useCallback(() => {
    if (uid != null) {
      dispatch(cancelPipeline())
    }
  }, [dispatch, uid])

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      if (isStartedSuccess && !isCanceled && uid != null) {
        dispatch(pollRunResult({ uid: uid }))
      }
    }, POLLING_INTERVAL)
    return () => {
      clearInterval(intervalId)
    }
  }, [dispatch, uid, isCanceled, isStartedSuccess])

  const status = useSelector(selectPipelineStatus)

  const { enqueueSnackbar } = useSnackbar()
  // タブ移動による再レンダリングするたびにスナックバーが実行されてしまう挙動を回避するために前回の値を保持
  const [prevStatus, setPrevStatus] = React.useState(status)
  React.useEffect(() => {
    if (prevStatus !== status) {
      if (status === RUN_STATUS.FINISHED) {
        enqueueSnackbar('Finished', { variant: 'success' })
        dispatch(getExperiments())
      } else if (status === RUN_STATUS.START_SUCCESS) {
        dispatch(getExperiments())
      } else if (status === RUN_STATUS.ABORTED) {
        enqueueSnackbar('Aborted', { variant: 'error' })
        dispatch(getExperiments())
      } else if (status === RUN_STATUS.CANCELED) {
        enqueueSnackbar('Canceled', { variant: 'info' })
        dispatch(getExperiments())
      }
      setPrevStatus(status)
    }
  }, [dispatch, status, prevStatus, enqueueSnackbar])

  return {
    filePathIsUndefined,
    algorithmNodeNotExist,
    uid,
    status,
    isStartedSuccess,
    handleRunPipeline,
    handleRunPipelineByUid,
    handleCancelPipeline,
  }
}
