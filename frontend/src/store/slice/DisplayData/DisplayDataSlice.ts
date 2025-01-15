import { createSlice, isAnyOf, PayloadAction } from "@reduxjs/toolkit"

import {
  getCsvData,
  getHeatMapData,
  getImageData,
  getTimeSeriesDataById,
  getTimeSeriesAllData,
  getRoiData,
  getScatterData,
  getBarData,
  getHTMLData,
  getTimeSeriesInitData,
  getHistogramData,
  getLineData,
  getPieData,
  getPolarData,
  cancelRoi,
  mergeRoi,
  addRoi,
  deleteRoi,
  commitRoi,
  clickRoi,
  getStatus,
} from "store/slice/DisplayData/DisplayDataActions"
import {
  DATA_TYPE,
  DATA_TYPE_SET,
  DisplayData,
  DISPLAY_DATA_SLICE_NAME,
} from "store/slice/DisplayData/DisplayDataType"
import { run, runByCurrentUid } from "store/slice/Pipeline/PipelineActions"
import {
  deleteDisplayItem,
  setNewDisplayDataPath,
} from "store/slice/VisualizeItem/VisualizeItemActions"

const initialState: DisplayData = {
  timeSeries: {},
  heatMap: {},
  image: {},
  csv: {},
  roi: {},
  scatter: {},
  bar: {},
  html: {},
  histogram: {},
  line: {},
  pie: {},
  polar: {},
  loading: false,
  loadingStack: [],
  statusRoi: {
    temp_add_roi: [],
    temp_delete_roi: [],
    temp_merge_roi: [],
    temp_selected_roi: [],
  },
  isEditRoiCommitting: false,
}

export const displayDataSlice = createSlice({
  name: DISPLAY_DATA_SLICE_NAME,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(deleteDisplayItem, (state, action) => {
        if (action.payload.deleteData) {
          const { filePath, dataType } = action.payload
          deleteDisplayDataFn(state, filePath, dataType)
        }
      })
      .addCase(setNewDisplayDataPath, (state, action) => {
        if (action.payload.deleteData) {
          const { prevDataType: dataType, prevFilePath: filePath } =
            action.payload
          deleteDisplayDataFn(state, filePath, dataType)
        }
      })
      .addCase(getTimeSeriesDataById.pending, (state, action) => {
        const { path } = action.meta.arg
        if (!Object.prototype.hasOwnProperty.call(state.timeSeries, path)) {
          state.timeSeries[path] = {
            type: "timeSeries",
            xrange: [],
            data: {},
            std: {},
            pending: true,
            fulfilled: false,
            error: null,
          }
        } else {
          state.timeSeries[path].pending = true
          state.timeSeries[path].fulfilled = false
          state.timeSeries[path].error = null
        }
      })
      .addCase(getTimeSeriesDataById.rejected, (state, action) => {
        const { path } = action.meta.arg
        state.timeSeries[path] = {
          type: "timeSeries",
          xrange: [],
          data: {},
          std: {},
          pending: false,
          fulfilled: false,
          error: action.error.message ?? "rejected",
        }
      })
      .addCase(getTimeSeriesDataById.fulfilled, (state, action) => {
        const { path, index } = action.meta.arg
        state.timeSeries[path].pending = false
        state.timeSeries[path].fulfilled = true
        state.timeSeries[path].error = null

        state.timeSeries[path].meta = action.payload.meta
        state.timeSeries[path].data[index] = action.payload.data[index]
        if (action.payload.std[index] !== undefined) {
          state.timeSeries[path].std[index] = action.payload.std[index]
        }
      })
      .addCase(getTimeSeriesAllData.pending, (state, action) => {
        const { path } = action.meta.arg
        if (!Object.prototype.hasOwnProperty.call(state.timeSeries, path)) {
          state.timeSeries[path] = {
            type: "timeSeries",
            xrange: [],
            data: {},
            std: {},
            pending: true,
            fulfilled: false,
            error: null,
          }
        } else {
          state.timeSeries[path].pending = true
          state.timeSeries[path].fulfilled = false
          state.timeSeries[path].error = null
        }
      })
      .addCase(getTimeSeriesAllData.rejected, (state, action) => {
        const { path } = action.meta.arg
        state.timeSeries[path] = {
          type: "timeSeries",
          xrange: [],
          data: {},
          std: {},
          pending: false,
          fulfilled: false,
          error: action.error.message ?? "rejected",
        }
      })
      .addCase(getTimeSeriesAllData.fulfilled, (state, action) => {
        const { path } = action.meta.arg
        state.timeSeries[path].pending = false
        state.timeSeries[path].fulfilled = true
        state.timeSeries[path].error = null
        state.timeSeries[path].xrange = action.payload.xrange
        state.timeSeries[path].meta = action.payload.meta
        state.timeSeries[path].data = action.payload.data
        if (action.payload.std !== undefined) {
          state.timeSeries[path].std = action.payload.std
        }
      })
      .addCase(getTimeSeriesInitData.pending, (state, action) => {
        const { path } = action.meta.arg
        if (!Object.prototype.hasOwnProperty.call(state.timeSeries, path)) {
          state.timeSeries[path] = {
            type: "timeSeries",
            xrange: [],
            data: {},
            std: {},
            pending: true,
            fulfilled: false,
            error: null,
          }
        } else {
          state.timeSeries[path].pending = true
          state.timeSeries[path].fulfilled = false
          state.timeSeries[path].error = null
        }
      })
      .addCase(getTimeSeriesInitData.rejected, (state, action) => {
        const { path } = action.meta.arg
        state.timeSeries[path] = {
          type: "timeSeries",
          xrange: [],
          data: {},
          std: {},
          pending: false,
          fulfilled: false,
          error: action.error.message ?? "rejected",
        }
      })
      .addCase(getTimeSeriesInitData.fulfilled, (state, action) => {
        const { path } = action.meta.arg
        state.timeSeries[path].pending = false
        state.timeSeries[path].fulfilled = true
        state.timeSeries[path].error = null

        state.timeSeries[path].xrange = action.payload.xrange
        state.timeSeries[path].meta = action.payload.meta
        state.timeSeries[path].data = action.payload.data
        state.timeSeries[path].std = action.payload.std
      })
      .addCase(getHeatMapData.pending, (state, action) => {
        const { path } = action.meta.arg
        state.heatMap[path] = {
          type: "heatMap",
          data: [],
          columns: [],
          index: [],
          pending: true,
          fulfilled: false,
          error: null,
        }
      })
      .addCase(getHeatMapData.rejected, (state, action) => {
        const { path } = action.meta.arg
        state.heatMap[path] = {
          type: "heatMap",
          data: [],
          columns: [],
          index: [],
          pending: false,
          fulfilled: false,
          error: action.error.message ?? "rejected",
        }
      })
      .addCase(getHeatMapData.fulfilled, (state, action) => {
        const { path } = action.meta.arg
        state.heatMap[path] = {
          type: "heatMap",
          data: action.payload.data,
          meta: action.payload.meta,
          columns: action.payload.columns,
          index: action.payload.index,
          pending: false,
          fulfilled: true,
          error: null,
        }
      })
      .addCase(getHistogramData.pending, (state, action) => {
        const { path } = action.meta.arg
        state.histogram[path] = {
          type: "histogram",
          data: [],
          pending: true,
          fulfilled: false,
          error: null,
        }
      })
      .addCase(getHistogramData.rejected, (state, action) => {
        const { path } = action.meta.arg
        state.histogram[path] = {
          type: "histogram",
          data: [],
          pending: false,
          fulfilled: false,
          error: action.error.message ?? "rejected",
        }
      })
      .addCase(getHistogramData.fulfilled, (state, action) => {
        const { path } = action.meta.arg
        state.histogram[path] = {
          type: "histogram",
          data: action.payload.data,
          meta: action.payload.meta,
          pending: false,
          fulfilled: true,
          error: null,
        }
      })
      .addCase(getLineData.pending, (state, action) => {
        const { path } = action.meta.arg
        state.line[path] = {
          type: "line",
          data: [],
          columns: [],
          index: [],
          pending: true,
          fulfilled: false,
          error: null,
        }
      })
      .addCase(getLineData.rejected, (state, action) => {
        const { path } = action.meta.arg
        state.line[path] = {
          type: "line",
          data: [],
          columns: [],
          index: [],
          pending: false,
          fulfilled: false,
          error: action.error.message ?? "rejected",
        }
      })
      .addCase(getLineData.fulfilled, (state, action) => {
        const { path } = action.meta.arg
        state.line[path] = {
          type: "line",
          data: action.payload.data,
          columns: action.payload.columns,
          index: action.payload.index,
          meta: action.payload.meta,
          pending: false,
          fulfilled: true,
          error: null,
        }
      })
      .addCase(getPieData.pending, (state, action) => {
        const { path } = action.meta.arg
        state.pie[path] = {
          type: "pie",
          data: [],
          columns: [],
          pending: true,
          fulfilled: false,
          error: null,
        }
      })
      .addCase(getPieData.rejected, (state, action) => {
        const { path } = action.meta.arg
        state.pie[path] = {
          type: "pie",
          data: [],
          columns: [],
          pending: false,
          fulfilled: false,
          error: action.error.message ?? "rejected",
        }
      })
      .addCase(getPieData.fulfilled, (state, action) => {
        const { path } = action.meta.arg
        state.pie[path] = {
          type: "pie",
          data: action.payload.data,
          columns: action.payload.columns,
          meta: action.payload.meta,
          pending: false,
          fulfilled: true,
          error: null,
        }
      })
      .addCase(getPolarData.pending, (state, action) => {
        const { path } = action.meta.arg
        state.polar[path] = {
          type: "polar",
          data: [],
          columns: [],
          index: [],
          pending: true,
          fulfilled: false,
          error: null,
        }
      })
      .addCase(getPolarData.rejected, (state, action) => {
        const { path } = action.meta.arg
        state.polar[path] = {
          type: "polar",
          data: [],
          columns: [],
          index: [],
          pending: false,
          fulfilled: false,
          error: action.error.message ?? "rejected",
        }
      })
      .addCase(getPolarData.fulfilled, (state, action) => {
        const { path } = action.meta.arg
        state.polar[path] = {
          type: "polar",
          data: action.payload.data,
          columns: action.payload.columns,
          index: action.payload.index,
          meta: action.payload.meta,
          pending: false,
          fulfilled: true,
          error: null,
        }
      })
      .addCase(getImageData.pending, (state, action) => {
        const { path } = action.meta.arg
        state.image[path] = {
          type: "image",
          data: [],
          pending: true,
          fulfilled: false,
          error: null,
        }
      })
      .addCase(getImageData.fulfilled, (state, action) => {
        const { path } = action.meta.arg
        state.image[path] = {
          type: "image",
          data: action.payload.data,
          meta: action.payload.meta,
          pending: false,
          fulfilled: true,
          error: null,
        }
      })
      .addCase(getImageData.rejected, (state, action) => {
        const { path } = action.meta.arg
        state.image[path] = {
          type: "image",
          data: [],
          pending: false,
          fulfilled: false,
          error: action.error.message ?? "rejected",
        }
      })
      .addCase(getCsvData.pending, (state, action) => {
        const { path } = action.meta.arg
        state.csv[path] = {
          type: "csv",
          data: [],
          pending: true,
          fulfilled: false,
          error: null,
        }
      })
      .addCase(getCsvData.fulfilled, (state, action) => {
        const { path } = action.meta.arg
        state.csv[path] = {
          type: "csv",
          data: action.payload.data,
          meta: action.payload.meta,
          pending: false,
          fulfilled: true,
          error: null,
        }
      })
      .addCase(getCsvData.rejected, (state, action) => {
        const { path } = action.meta.arg
        state.csv[path] = {
          type: "csv",
          data: [],
          pending: false,
          fulfilled: false,
          error: action.error.message ?? "rejected",
        }
      })
      .addCase(getRoiData.pending, (state, action) => {
        const { path } = action.meta.arg

        state.loadingStack.push((state.loading = true))

        state.roi[path] = {
          type: "roi",
          data: [],
          pending: true,
          fulfilled: false,
          error: null,
          roiUniqueList: [],
        }
      })
      .addCase(getRoiData.fulfilled, (state, action) => {
        const { path } = action.meta.arg
        const { data } = action.payload

        state.loadingStack.pop()
        state.loading = state.loadingStack.length > 0

        // 計算
        const roi1Ddata: number[] = data[0]
          .map((row) =>
            Array.from(new Set(row.filter((value) => value != null))),
          )
          .flat()
        const roiUniqueIdList = Array.from(new Set(roi1Ddata))
          .sort((n1, n2) => n1 - n2)
          .map(String)

        state.roi[path] = {
          type: "roi",
          data: data,
          meta: action.payload.meta,
          pending: false,
          fulfilled: true,
          error: null,
          roiUniqueList: roiUniqueIdList,
        }
      })
      .addCase(getRoiData.rejected, (state, action) => {
        const { path } = action.meta.arg

        state.loadingStack.pop()
        state.loading = state.loadingStack.length > 0

        state.roi[path] = {
          type: "roi",
          data: [],
          pending: false,
          fulfilled: false,
          error: action.error.message ?? "rejected",
          roiUniqueList: [],
        }
      })
      .addCase(getScatterData.pending, (state, action) => {
        const { path } = action.meta.arg
        state.scatter[path] = {
          type: "scatter",
          data: {},
          pending: true,
          fulfilled: false,
          error: null,
        }
      })
      .addCase(getScatterData.fulfilled, (state, action) => {
        const { path } = action.meta.arg
        state.scatter[path] = {
          type: "scatter",
          data: action.payload.data,
          meta: action.payload.meta,
          pending: false,
          fulfilled: true,
          error: null,
        }
      })
      .addCase(getScatterData.rejected, (state, action) => {
        const { path } = action.meta.arg
        state.scatter[path] = {
          type: "scatter",
          data: {},
          pending: false,
          fulfilled: false,
          error: action.error.message ?? "rejected",
        }
      })
      .addCase(getBarData.pending, (state, action) => {
        const { path } = action.meta.arg
        state.bar[path] = {
          type: "bar",
          data: {},
          columns: [],
          index: [],
          pending: true,
          fulfilled: false,
          error: null,
        }
      })
      .addCase(getBarData.rejected, (state, action) => {
        const { path } = action.meta.arg
        state.bar[path] = {
          type: "bar",
          data: {},
          columns: [],
          index: [],
          pending: false,
          fulfilled: false,
          error: action.error.message ?? "rejected",
        }
      })
      .addCase(getBarData.fulfilled, (state, action) => {
        const { path } = action.meta.arg
        state.bar[path] = {
          type: "bar",
          data: action.payload.data,
          meta: action.payload.meta,
          columns: action.payload.columns,
          index: action.payload.index,
          pending: false,
          fulfilled: true,
          error: null,
        }
      })
      .addCase(getHTMLData.pending, (state, action) => {
        const { path } = action.meta.arg
        state.html[path] = {
          type: "html",
          data: "",
          pending: true,
          fulfilled: false,
          error: null,
        }
      })
      .addCase(getHTMLData.fulfilled, (state, action) => {
        const { path } = action.meta.arg
        state.html[path] = {
          type: "html",
          data: action.payload.data,
          meta: action.payload.meta,
          pending: false,
          fulfilled: true,
          error: null,
        }
      })
      .addCase(getHTMLData.rejected, (state, action) => {
        const { path } = action.meta.arg
        state.html[path] = {
          type: "html",
          data: "",
          pending: false,
          fulfilled: false,
          error: action.error.message ?? "rejected",
        }
      })
      .addCase(getStatus.fulfilled, (state, action) => {
        state.statusRoi = action.payload

        state.loadingStack.pop()
        state.loading = state.loadingStack.length > 0
      })
      .addCase(cancelRoi.fulfilled, (state) => {
        state.statusRoi = {
          temp_add_roi: [],
          temp_delete_roi: [],
          temp_merge_roi: [],
          temp_selected_roi: [],
        }

        state.loadingStack.pop()
        state.loading = state.loadingStack.length > 0
      })
      .addCase(commitRoi.pending, (state) => {
        state.isEditRoiCommitting = true

        state.loadingStack.push((state.loading = true))
      })
      .addCase(
        clickRoi,
        (state, action: PayloadAction<{ roiIndex: number }>) => {
          const { roiIndex } = action.payload
          if (!state.statusRoi) {
            state.statusRoi = {
              temp_add_roi: [],
              temp_delete_roi: [],
              temp_merge_roi: [],
              temp_selected_roi: [],
            }
          }
          state.statusRoi.temp_add_roi = state.statusRoi.temp_add_roi || []
          state.statusRoi.temp_delete_roi =
            state.statusRoi.temp_delete_roi || []
          state.statusRoi.temp_merge_roi = state.statusRoi.temp_merge_roi || []
          state.statusRoi.temp_selected_roi =
            state.statusRoi.temp_selected_roi || []

          const index = state.statusRoi.temp_selected_roi.indexOf(roiIndex)
          if (index === -1) {
            // If not selected, add it
            state.statusRoi.temp_selected_roi.push(roiIndex)
          } else {
            // If already selected, remove it
            state.statusRoi.temp_selected_roi.splice(index, 1)
          }
        },
      )
      .addMatcher(
        isAnyOf(
          cancelRoi.pending,
          mergeRoi.pending,
          deleteRoi.pending,
          addRoi.pending,
          getStatus.pending,
        ),
        (state) => {
          state.loadingStack.push((state.loading = true))
        },
      )
      .addMatcher(
        isAnyOf(
          cancelRoi.rejected,
          mergeRoi.rejected,
          mergeRoi.fulfilled,
          addRoi.rejected,
          addRoi.fulfilled,
          deleteRoi.rejected,
          deleteRoi.fulfilled,
          getStatus.rejected,
        ),
        (state) => {
          state.loadingStack.pop()
          state.loading = state.loadingStack.length > 0
        },
      )
      .addMatcher(isAnyOf(commitRoi.rejected, commitRoi.fulfilled), (state) => {
        state.isEditRoiCommitting = false

        state.loadingStack.pop()
        state.loading = state.loadingStack.length > 0
      })
      .addMatcher(
        isAnyOf(run.fulfilled, runByCurrentUid.fulfilled),
        () => initialState,
      )
  },
})

function deleteDisplayDataFn(
  state: DisplayData,
  filePath: string,
  dataType: DATA_TYPE,
) {
  if (dataType === DATA_TYPE_SET.IMAGE) {
    delete state.image[filePath]
  } else if (dataType === DATA_TYPE_SET.TIME_SERIES) {
    delete state.timeSeries[filePath]
  } else if (dataType === DATA_TYPE_SET.CSV) {
    delete state.csv[filePath]
  } else if (dataType === DATA_TYPE_SET.HEAT_MAP) {
    delete state.heatMap[filePath]
    // } else if (dataType === DATA_TYPE_SET.ROI) {
    //   delete state.roi[filePath]
  } else if (dataType === DATA_TYPE_SET.SCATTER) {
    delete state.scatter[filePath]
  } else if (dataType === DATA_TYPE_SET.BAR) {
    delete state.bar[filePath]
  } else if (dataType === DATA_TYPE_SET.HTML) {
    delete state.html[filePath]
  } else if (dataType === DATA_TYPE_SET.HISTOGRAM) {
    delete state.histogram[filePath]
  } else if (dataType === DATA_TYPE_SET.LINE) {
    delete state.line[filePath]
  } else if (dataType === DATA_TYPE_SET.PIE) {
    delete state.pie[filePath]
  } else if (dataType === DATA_TYPE_SET.POLAR) {
    delete state.polar[filePath]
  }
}

export default displayDataSlice.reducer
