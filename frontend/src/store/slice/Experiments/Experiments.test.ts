import { expect, describe, test } from "@jest/globals"

import {
  copyExperimentByList,
  deleteExperimentByList,
  deleteExperimentByUid,
  getExperiments,
} from "store/slice/Experiments/ExperimentsActions"
import reducer, { initialState } from "store/slice/Experiments/ExperimentsSlice"

describe("Experiments", () => {
  const uid1 = "96844a59"
  const uid2 = "eee981f0"
  const getExperimentsPendingAction = {
    type: getExperiments.pending.type,
    meta: {
      requestId: "FmYmw6sCHA2Ll5JJfPuJN",
      requestStatus: "pending",
    },
  }
  const getExperimentsFulfilledAction = {
    type: getExperiments.fulfilled.type,
    meta: {
      requestId: "FmYmw6sCHA2Ll5JJfPuJN",
      requestStatus: "pending",
    },
    payload: {
      [uid1]: {
        started_at: "2022-05-07 05:26:54",
        finished_at: "2022-05-07 05:26:55",
        name: "record test",
        unique_id: uid1,
        hasNWB: true,
        success: "success",
        function: {
          dummy_image2image8time_4mrz8h7hyk: {
            unique_id: "dummy_image2image8time_4mrz8h7hyk",
            name: "dummy_image2image8time",
            success: "success",
            hasNWB: true,
          },
          dummy_image2image_c8tqfxw0mq: {
            unique_id: "dummy_image2image_c8tqfxw0mq",
            name: "dummy_image2image",
            success: "success",
            hasNWB: true,
          },
          input_0: {
            unique_id: "input_0",
            name: "hoge.tif",
            success: "success",
            hasNWB: false,
          },
        },
        nodeDict: {},
        edgeDict: {},
        nwb: {
          imaging_plane: {
            imaging_rate: 30,
          },
        },
      },
      [uid2]: {
        started_at: "2022-05-07 05:54:53",
        finished_at: "2022-05-07 05:54:54",
        name: "New flow",
        unique_id: uid2,
        hasNWB: true,
        success: "success",
        function: {
          dummy_image2image8time_4mrz8h7hyk: {
            unique_id: "dummy_image2image8time_4mrz8h7hyk",
            name: "dummy_image2image8time",
            success: "success",
            hasNWB: true,
          },
          dummy_image2image_c8tqfxw0mq: {
            unique_id: "dummy_image2image_c8tqfxw0mq",
            name: "dummy_image2image",
            success: "success",
            hasNWB: true,
          },
          input_0: {
            unique_id: "input_0",
            name: "hoge.tif",
            success: "success",
            hasNWB: false,
          },
        },
        nodeDict: {},
        edgeDict: {},
        nwb: {
          imaging_plane: {
            imaging_rate: 30,
          },
        },
      },
    },
  }

  test(getExperiments.fulfilled.type, () => {
    const targetState = reducer(
      reducer(initialState, getExperimentsPendingAction),
      getExperimentsFulfilledAction,
    )
    const expectState = {
      status: "fulfilled",
      loading: false,
      experimentList: {
        [uid1]: {
          uid: uid1,
          startedAt: "2022-05-07 05:26:54",
          finishedAt: "2022-05-07 05:26:55",
          frameRate: 30,
          name: "record test",
          hasNWB: true,
          status: "success",
          functions: {
            dummy_image2image8time_4mrz8h7hyk: {
              name: "dummy_image2image8time",
              nodeId: "dummy_image2image8time_4mrz8h7hyk",
              status: "success",
              hasNWB: true,
            },
            dummy_image2image_c8tqfxw0mq: {
              name: "dummy_image2image",
              nodeId: "dummy_image2image_c8tqfxw0mq",
              status: "success",
              hasNWB: true,
            },
            input_0: {
              name: "hoge.tif",
              nodeId: "input_0",
              status: "success",
              hasNWB: false,
            },
          },
        },
        [uid2]: {
          uid: uid2,
          startedAt: "2022-05-07 05:54:53",
          finishedAt: "2022-05-07 05:54:54",
          frameRate: 30,
          name: "New flow",
          hasNWB: true,
          status: "success",
          functions: {
            dummy_image2image8time_4mrz8h7hyk: {
              name: "dummy_image2image8time",
              nodeId: "dummy_image2image8time_4mrz8h7hyk",
              status: "success",
              hasNWB: true,
            },
            dummy_image2image_c8tqfxw0mq: {
              name: "dummy_image2image",
              nodeId: "dummy_image2image_c8tqfxw0mq",
              status: "success",
              hasNWB: true,
            },
            input_0: {
              name: "hoge.tif",
              nodeId: "input_0",
              status: "success",
              hasNWB: false,
            },
          },
        },
      },
    }

    expect(targetState).toEqual(expectState)
  })

  // 単一削除
  test(deleteExperimentByUid.fulfilled.type, () => {
    const prevState = reducer(
      reducer(initialState, getExperimentsPendingAction),
      getExperimentsFulfilledAction,
    )
    const deleteExperimentByUidFulfilledAction = {
      type: deleteExperimentByUid.fulfilled.type,
      payload: true,
      meta: {
        arg: uid2,
        requestId: "FZcujcGG38JPwbQDR6c-J",
        requestStatus: "fulfilled",
      },
    }
    const targetState = reducer(prevState, deleteExperimentByUidFulfilledAction)
    expect(
      targetState.status === "fulfilled" &&
        !Object.keys(targetState.experimentList).includes(uid2),
    ).toBe(true)
  })

  // 複数削除
  test(deleteExperimentByList.fulfilled.type, () => {
    const prevState = reducer(
      reducer(initialState, getExperimentsPendingAction),
      getExperimentsFulfilledAction,
    )
    const deleteExperimentByListFulfilledAction = {
      type: deleteExperimentByList.fulfilled.type,
      payload: true,
      meta: {
        arg: [uid1, uid2],
        requestId: "faNrL5ZV3SRODugFlJM20",
        requestStatus: "fulfilled",
      },
    }
    const targetState = reducer(
      prevState,
      deleteExperimentByListFulfilledAction,
    )
    expect(
      targetState.status === "fulfilled" && targetState.experimentList,
    ).toEqual({})
  })

  test(copyExperimentByList.fulfilled.type, () => {
    const prevState = reducer(
      reducer(initialState, getExperimentsPendingAction),
      getExperimentsFulfilledAction,
    )
    const copyExperimentByListFulfilledAction = {
      type: copyExperimentByList.fulfilled.type,
      payload: true,
      meta: {
        arg: [uid1, uid2],
        requestId: "faNrL5ZV3SRODugFlJM20",
        requestStatus: "fulfilled",
      },
    }
    const targetState = reducer(prevState, copyExperimentByListFulfilledAction)
    expect(targetState.loading).toBe(false)
  })

  test(copyExperimentByList.pending.type, () => {
    const prevState = reducer(
      reducer(initialState, getExperimentsPendingAction),
      getExperimentsFulfilledAction,
    )
    const copyExperimentByListPendingAction = {
      type: copyExperimentByList.pending.type,
      meta: {
        arg: [uid1, uid2],
        requestId: "faNrL5ZV3SRODugFlJM20",
        requestStatus: "pending",
      },
    }
    const targetState = reducer(prevState, copyExperimentByListPendingAction)
    expect(targetState.loading).toBe(true)
  })

  test(copyExperimentByList.rejected.type, () => {
    const prevState = reducer(
      reducer(initialState, getExperimentsPendingAction),
      getExperimentsFulfilledAction,
    )
    const copyExperimentByListRejectedAction = {
      type: copyExperimentByList.rejected.type,
      payload: false,
      meta: {
        arg: [uid1, uid2],
        requestId: "faNrL5ZV3SRODugFlJM20",
        requestStatus: "rejected",
      },
    }
    const targetState = reducer(prevState, copyExperimentByListRejectedAction)
    expect(targetState.loading).toBe(false)
  })
})
