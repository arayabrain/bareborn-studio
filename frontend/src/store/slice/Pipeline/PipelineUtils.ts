import { RunPostData, RunResultDTO, OutputPathsDTO } from "api/run/Run"
import { toDataType } from "store/slice/DisplayData/DisplayDataUtils"
import { NODE_TYPE_SET } from "store/slice/FlowElement/FlowElementType"
import {
  RunResult,
  OutputPaths,
  NODE_RESULT_STATUS,
  PipelineType,
  RUN_STATUS,
  StartedPipeline,
  NodeResultPending,
  NodeResultError,
  NodeResultSuccess,
  NodeResult,
} from "store/slice/Pipeline/PipelineType"

export function isNodeResultPending(
  nodeResult: NodeResult,
): nodeResult is NodeResultPending {
  return nodeResult.status === NODE_RESULT_STATUS.PENDING
}

export function isNodeResultSuccess(
  nodeResult: NodeResult,
): nodeResult is NodeResultSuccess {
  return nodeResult.status === NODE_RESULT_STATUS.SUCCESS
}

export function isNodeResultError(
  nodeResult: NodeResult,
): nodeResult is NodeResultError {
  return nodeResult.status === NODE_RESULT_STATUS.ERROR
}

export function isStartedPipeline(
  pipeline: PipelineType,
): pipeline is StartedPipeline {
  return (
    pipeline.status === RUN_STATUS.START_SUCCESS ||
    pipeline.status === RUN_STATUS.FINISHED ||
    pipeline.status === RUN_STATUS.ABORTED
  )
}

export function getInitialRunResult(runPostData: RunPostData) {
  const initialResult: RunResult = {}
  Object.values(runPostData.nodeDict)
    .filter(({ data }) => data?.type === NODE_TYPE_SET.ALGORITHM)
    .forEach(({ id, data }) => {
      initialResult[id] = {
        status: NODE_RESULT_STATUS.PENDING,
        name: data?.label ?? "",
      }
    })
  return initialResult
}

export function convertToRunResult(dto: RunResultDTO) {
  const result: RunResult = {}
  Object.entries(dto).forEach(([nodeId, nodeResultDto]) => {
    const outputPath = nodeResultDto.outputPaths
    if (nodeResultDto.status === "success" && outputPath != null) {
      result[nodeId] = {
        status: NODE_RESULT_STATUS.SUCCESS,
        message: nodeResultDto.message,
        name: nodeResultDto.name,
        outputPaths: convertToOutputPath(outputPath),
      }
    } else if (nodeResultDto.status === "running") {
      result[nodeId] = {
        status: NODE_RESULT_STATUS.PENDING,
        name: nodeResultDto.name,
      }
    } else {
      result[nodeId] = {
        status: NODE_RESULT_STATUS.ERROR,
        message: nodeResultDto.message,
        name: nodeResultDto.name,
      }
    }
  })
  return result
}

function convertToOutputPath(dto: OutputPathsDTO) {
  const result: OutputPaths = {}
  Object.entries(dto).forEach(([functionPath, value]) => {
    result[functionPath] = {
      path: value.path,
      data_shape: value.data_shape,
      max_index: value.max_index,
      type: toDataType(value.type),
    }
  })
  return result
}
