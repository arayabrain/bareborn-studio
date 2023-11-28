from typing import List, Optional, Union

import numpy as np
import pandas as pd
from pydantic import BaseModel
from pydantic.dataclasses import Field

from studio.app.common.core.algo import AlgoTemplate
from studio.app.common.dataclass import HeatMapData  # , TimeSeriesData
from studio.app.optinist.core.nwb.nwb import NWBDATASET
from studio.app.optinist.dataclass import BehaviorData, FluoData, IscellData
from studio.app.optinist.wrappers.optinist.utils import standard_norm


class DPCAParams(BaseModel):
    transpose: bool = Field(False)
    standard_mean: bool = Field(True)
    standard_std: bool = Field(True)
    labels: Union[int, str] = Field(
        "tbc",
        description=(
            "Labels of feature axis. "
            "If int the corresponding number of labels are selected "
            "from the alphabet 'abcde...'"
            "--- seems int is not accepted. "
            "numbers of characters should match the dimension of the data"
        ),
    )
    join: Optional[dict] = Field(
        None,
        description=(
            "Parameter combinations to join. "
            "If a data set has parametrized by time t and stimulus s, "
            "then dPCA will split the data into marginalizations "
            "corresponding to 't', 's' and 'ts'. "
            "At times, we want to join different marginalizations (like 's' and 'ts') "
            "e.g. if we are only interested in the time-modulated stimulus components. "
            "In this case, we would pass {'ts' : ['s','ts']}."
        ),
    )
    regularizer: Union[float, str, None] = Field(
        0,
        description=(
            "Regularization parameter. This can take None, float, str 'auto'"
            "If None or 0, then no regularization is applied. "
            "For float, the regularization weight is regularizer*var(data). "
            "If 'auto', the optimal regularization parameter is found "
            "during fitting (might take some time)."
        ),
    )
    n_components: Union[int, dict, None] = Field(
        8,
        description=(
            "Number of components to keep."
            "If n_components is int, then the same number of components are kept "
            "in every marginalization. "
            "Otherwise, the dict allows to set the number of components "
            "in each marginalization (e.g. {'t' : 10, 'ts' : 5})."
        ),
    )
    copy: bool = Field(
        True,
        description=(
            "If False, data passed to fit are overwritten and running fit(X). "
            "transform(X) will not yield the expected results, "
            "use fit_transform(X) instead."
        ),
    )
    n_iter: int = Field(
        0, description="Number of iterations for randomized SVD solver (sklearn)."
    )
    trigger_column: int = Field(1)
    trigger_type: str = Field("down")
    trigger_threshold: int = Field(0)
    trigger_duration: List[int] = Field([-10, 10])
    feature_colums: List[int] = Field([3, 4])
    figure_components: List[int] = Field([0, 1])
    figure_features: List[str] = Field(["t", "b", "c", "tbc"])


class DPCAFit(AlgoTemplate):
    def run(
        self,
        params: DPCAParams,
        neural_data: FluoData,
        behaviors_data: BehaviorData,
        iscell: IscellData = None,
    ) -> dict():
        # modules specific to function
        from dPCA import dPCA

        print("start dpca:", self.function_id)

        neural_data = neural_data.data
        behaviors_data = behaviors_data.data

        # neural data should be time x cells
        if params["transpose"]:
            X = neural_data.transpose()
        else:
            X = neural_data

        if iscell is not None:
            iscell = iscell.data
            ind = np.where(iscell > 0)[0]
            X = X[:, ind]

        # preprocessing
        X = standard_norm(X, params["standard_mean"], params["standard_std"])

        # create trigger and features
        [Trig, features] = self.reshapeBehavior(
            behaviors_data,
            params["trigger_column"],
            params["trigger_type"],
            params["trigger_threshold"],
            params["feature_colums"],
        )
        X = self.createMatrix(X, Trig, features, params["trigger_duration"])

        # calculate dPCA  #

        # X: array - like, shape(n_samples, n_features_1, n_features_2, ...)
        # Training data, where n_samples in the number of samples
        # and n_features_j is the number
        # of the j - features(where the axis correspond to different parameters).

        dpca = dPCA.dPCA(
            labels=params["labels"],
            join=params["join"],
            regularizer=params["regularizer"],
            n_components=params["n_components"],
            copy=params["copy"],
            n_iter=params["n_iter"],
        )

        result = dpca.fit_transform(np.mean(X, axis=0), X)
        keys = list(result.keys())

        Out_forfigure = {}
        # figure shows only assigned components and properties
        for i in range(len(params["figure_features"])):
            for j in range(len(params["figure_components"])):
                tp = result[params["figure_features"][i]][
                    params["figure_components"][j],
                ]  # 1st component
                inds = self.GetIndices(tp.shape[1:], "matrix")
                arr = np.zeros([tp.shape[0], inds.shape[0]])
                for m in range(inds.shape[0]):
                    for k in range(tp.shape[0]):
                        arr[k, m] = tp[tuple([k] + list(inds[m, :]))]

                Out_forfigure[
                    params["figure_features"][i]
                    + "-component"
                    + str(params["figure_components"][j])
                ] = arr
        Out_forfigure["features"] = list(Out_forfigure.keys())

        names = []
        for i in range(inds.shape[0]):
            names.append("feature" + "_".join(map(str, inds[i, :])))
        Out_forfigure["trace_names"] = names

        # NWB
        tpdic = {}
        for i in range(len(keys)):
            tpdic[keys[i]] = result[keys[i]]

        nwbfile = {}
        nwbfile[NWBDATASET.POSTPROCESS] = {self.function_id: {**tpdic}}

        info = {}
        for i in range(len(Out_forfigure["features"])):
            # info[Out_forfigure["features"][i]] = TimeSeriesData(
            #     Out_forfigure[Out_forfigure["features"][i]].transpose(),
            #     std=None,
            #     index=None,
            #     file_name=Out_forfigure["features"][i],
            # )

            info[Out_forfigure["features"][i]] = HeatMapData(
                Out_forfigure[Out_forfigure["features"][i]].transpose(),
                columns=None,
                file_name=Out_forfigure["features"][i],
            )
        info["nwbfile"] = nwbfile

        return info

    @classmethod
    def GetIndices(cls, dims, outtype):
        index = np.indices(dims)
        ind = []
        for i in range(len(index)):
            ind.append(index[i].flatten())
        ind = np.array(ind)
        ind = ind.transpose()

        if outtype == "list":
            out = []
            for i in range(ind.shape[1]):
                out.append(ind[:, i])
        else:
            out = ind

        return out

    @classmethod
    def reshapeBehavior(
        cls, B, trigger_column, trigger_type, trigger_threshold, feature_columns
    ):
        Trig = cls.calc_trigger(B[:, trigger_column], trigger_type, trigger_threshold)

        features = []
        for i in range(len(feature_columns)):
            features.append(B[Trig, feature_columns[i]])

        return [Trig, features]

    @classmethod
    def createMatrix(cls, D, triggers, stims, duration):
        # D: num_timestamps x num_unit   neural data
        # triggers: index of trigger
        # stims: list of stimulus property for each trigger
        # durations: frames before and after trigger to use

        num_unit = D.shape[1]
        num_triggers = len(triggers)
        num_property = len(stims)
        num_timepoints = duration[1] - duration[0]

        # X is the reshaped data for each trigger
        X = np.zeros([num_triggers, num_unit, num_timepoints])
        for i in range(num_triggers):
            X[i, :, :] = D[
                triggers[i] + duration[0] : triggers[i] + duration[1], :
            ].transpose()

        # df is the table of stimulus conditions
        # df: number of trigger x ( number of property +1 )
        # uq_stims = list of unique stimulus for each property
        # num_uq_stims = number of unique_stims for each property

        columns = columns = list(map(str, range(num_property)))
        columns.append("all")
        df = pd.DataFrame(data=None, index=list(range(num_triggers)), columns=columns)
        for i in range(num_property):
            df[columns[i]] = stims[i]

        for i in range(num_triggers):
            df.iloc[i, num_property] = "_".join(
                map(str, df.iloc[i, 0:2].values.tolist())
            )

        uq_list = df["all"].unique()
        uq_stims = []
        num_uq_stims = []
        for i in range(num_property):
            uq_stims.append(list(df.iloc[:, i].unique()))
            num_uq_stims.append(len(uq_stims[i]))

        #  check number of samples
        # n: number of samples for each condition
        # index: index of the trigger for each condition
        # min_sample: minimum number of samples for a condition
        n = np.zeros([len(uq_list)], dtype=int)
        index = []
        for i in range(len(uq_list)):
            index.append(list(df[df["all"] == uq_list[i]].index))
            n[i] = len(index[i])

        min_sample = int(np.min(n))

        # re-format the data (number of samples is set to the nun_sample)
        X2 = np.zeros([min_sample, num_unit, num_timepoints] + num_uq_stims)

        for i in range(len(index)):
            stims = list(df.iloc[index[i][0], 0 : df.shape[1] - 1])
            tgtind = []
            for j in range(len(stims)):
                tgtind.append(uq_stims[j].index(stims[j]))

            if num_property == 1:
                X2[0:min_sample, :, :, tgtind[0]] = X[index[i][0:min_sample], :, :]
            elif num_property == 2:
                X2[0:min_sample, :, :, tgtind[0], tgtind[1]] = X[
                    index[i][0:min_sample], :, :
                ]
            elif num_property == 3:
                X2[0:min_sample, :, :, tgtind[0], tgtind[1], tgtind[2]] = X[
                    index[i][0:min_sample], :, :
                ]

            else:
                print(
                    "currently the number of condition category has to be less than 4"
                )
                return

        return X2

    @classmethod
    def calc_trigger(cls, behavior_data, trigger_type, trigger_threshold):
        # same function is also in the eta
        flg = np.array(behavior_data > trigger_threshold, dtype=int)
        if trigger_type == "up":
            trigger_idx = np.where(np.ediff1d(flg) == 1)[0]
        elif trigger_type == "down":
            trigger_idx = np.where(np.ediff1d(flg) == -1)[0]
        elif trigger_type == "cross":
            trigger_idx = np.where(np.ediff1d(flg) != 0)[0]
        else:
            trigger_idx = np.where(np.ediff1d(flg) == 0)[0]

        return trigger_idx
