from typing import List, Optional, Union

from pydantic import BaseModel
from pydantic.dataclasses import Field

from studio.app.common.core.algo import AlgoTemplate
from studio.app.common.dataclass import BarData
from studio.app.optinist.core.nwb.nwb import NWBDATASET
from studio.app.optinist.dataclass import BehaviorData, FluoData, IscellData
from studio.app.optinist.wrappers.optinist.utils import standard_norm


class CVParams(BaseModel):
    n_splits: int = Field(5, description="Number of folds. Must be at least 2.")
    shuffle: bool = Field(False)
    # random_state: int = Field(0)


class LDAMainParams(BaseModel):
    solver: str = Field("svd")
    shrinkage: Union[str, float, None] = Field(None)
    priors: Optional[List] = Field(None)
    n_components: Optional[int] = Field(None)
    store_covariance: bool = Field(False)
    tol: float = Field(0.0001)
    covariance_estimator: Optional[str] = Field(None)


class LDAParams(BaseModel):
    standard_x_mean: bool = Field(True)
    standard_x_std: bool = Field(True)
    transpose_x: bool = Field(True)
    transpose_y: bool = Field(False)
    target_index: int = Field(1)
    CV: CVParams = Field(CVParams())
    LDA: LDAMainParams = Field(LDAMainParams())


class LDA(AlgoTemplate):
    def run(
        self,
        params: LDAParams,
        neural_data: FluoData,
        behaviors_data: BehaviorData,
        iscell: IscellData = None,
    ) -> dict():
        # modules specific to function
        import numpy as np
        from sklearn.discriminant_analysis import LinearDiscriminantAnalysis as LDA
        from sklearn.model_selection import StratifiedKFold

        print("start LDA:", self.function_id)

        neural_data = neural_data.data
        behaviors_data = behaviors_data.data

        # data should be time x component matrix
        if params["transpose_x"]:
            X = neural_data.transpose()
        else:
            X = neural_data

        if params["transpose_y"]:
            Y = behaviors_data.transpose()
        else:
            Y = behaviors_data

        assert (
            X.shape[0] == Y.shape[0]
        ), f"""
            neural_data and behaviors_data is not same dimension,
            neural.shape{neural_data.shape}, behavior.shape{behaviors_data.shape}"""

        if iscell is not None:
            iscell = iscell.data
            ind = np.where(iscell > 0)[0]
            X = X[:, ind]

        Y = Y[:, params["target_index"]].reshape(-1, 1)

        # preprocessing
        tX = standard_norm(X, params["standard_x_mean"], params["standard_x_std"])

        # cross validation of LDA model
        skf = StratifiedKFold(**params["CV"])

        score = []
        classifier = []
        for train_index, test_index in skf.split(tX, Y):
            clf = LDA(**params["LDA"])

            if tX.shape[0] == 1:
                clf.fit(tX[train_index].reshape(-1, 1), Y[train_index])
                score.append(clf.score(tX[test_index].reshape(-1, 1), Y[test_index]))
                classifier.append(clf)
            else:
                clf.fit(tX[train_index, :], Y[train_index])
                score.append(clf.score(tX[test_index, :], Y[test_index]))
                classifier.append(clf)

        # NWB追加
        nwbfile = {}
        nwbfile[NWBDATASET.POSTPROCESS] = {
            self.function_id: {
                "score": score,
            }
        }

        info = {"score": BarData(score, file_name="score"), "nwbfile": nwbfile}

        return info
