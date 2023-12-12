from typing import List, Optional, Union

from pydantic import BaseModel
from pydantic.dataclasses import Field

from studio.app.common.core.algo import AlgoTemplate
from studio.app.common.dataclass import BarData
from studio.app.optinist.core.nwb.nwb import NWBDATASET
from studio.app.optinist.dataclass import BehaviorData, FluoData, IscellData
from studio.app.optinist.wrappers.optinist.utils import standard_norm


class SVMGridSearchParamGridParams(BaseModel):
    C: List[float] = Field([0.001, 0.01, 0.1])
    kernel: List[str] = Field(["linear"])
    degree: List[int] = Field([3])
    gamma: List[str] = Field(["scale"])
    coef0: List[float] = Field([0.0])
    shrinking: List[bool] = Field([True])
    tol: List[float] = Field([0.001])
    decision_function_shape: List[str] = Field(["ovr"])


class SVMGridSearchCVParams(BaseModel):
    scoring: str = Field("accuracy")
    n_jobs: int = Field(1)
    refit: bool = Field(True)
    cv: Optional[int] = Field(None)
    verbose: int = Field(3)
    pre_dispatch: str = Field("2*n_jobs")
    error_score: int = Field(-1000000)
    return_train_score: bool = Field(False)


class SVMGridSearchParams(BaseModel):
    param_grid: SVMGridSearchParamGridParams = Field(SVMGridSearchParamGridParams())
    CV: SVMGridSearchCVParams = Field(SVMGridSearchCVParams())


class SVMCVParams(BaseModel):
    n_splits: int = Field(5)
    shuffle: bool = Field(True)
    # random_state: int = Field(0)


class SVMSVCParams(BaseModel):
    C: float = Field(1.0)
    kernel: str = Field("rbf")
    degree: int = Field(3)
    gamma: str = Field("scale")
    coef0: float = Field(0.0)
    shrinking: bool = Field(True)
    probability: bool = Field(False)
    tol: float = Field(0.001)
    cache_size: float = Field(200)
    class_weight: Union[str, dict, None] = Field(None)
    max_iter: int = Field(-1)
    decision_function_shape: str = Field("ovr")
    break_ties: bool = Field(False)
    random_state: int = Field(0)


class SVMParams(BaseModel):
    standard_x_mean: bool = Field(True)
    standard_x_std: bool = Field(True)
    transpose_x: bool = Field(True)
    transpose_y: bool = Field(False)
    target_index: int = Field(1)
    use_grid_search: bool = Field(True)
    grid_search: SVMGridSearchParams = Field(SVMGridSearchParams())
    CV: SVMCVParams = Field(SVMCVParams())
    SVC: SVMSVCParams = Field(SVMSVCParams())


class SVM(AlgoTemplate):
    def run(
        self,
        params: SVMParams,
        neural_data: FluoData,
        behaviors_data: BehaviorData,
        iscell: IscellData = None,
    ) -> dict():
        # modules specific to function
        import numpy as np
        from sklearn import svm
        from sklearn.model_selection import GridSearchCV, StratifiedKFold

        print("start SVM:", self.function_id)

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
            neural.shape{X.shape}, behavior.shape{Y.shape}"""

        if iscell is not None:
            iscell = iscell.data
            ind = np.where(iscell > 0)[0]
            X = X[:, ind]

        Y = Y[:, params["target_index"]].reshape(-1, 1)

        # preprocessing
        tX = standard_norm(X, params["standard_x_mean"], params["standard_x_std"])

        hp = params["SVC"]

        # SVM determination of hyper parameters if needed
        gs_clf = []
        if params["use_grid_search"]:
            param_grid = [params["grid_search"]["param_grid"]]
            gs_clf = GridSearchCV(
                svm.SVC(), param_grid=param_grid, **params["grid_search"]["CV"]
            )

            gs_clf.fit(tX, Y)

            # insert best parameter to hp dictionary
            keys = list(gs_clf.best_params_.keys())
            for i in range(len(keys)):
                hp[keys[i]] = gs_clf.best_params_[keys[i]]

        # cross validation of SVM using best grid search paraneters
        skf = StratifiedKFold(**params["CV"])

        score = []
        classifier = []
        for train_index, test_index in skf.split(tX, Y):
            clf = svm.SVC(**hp)

            if tX.shape[0] == 1:
                clf.fit(tX[train_index].reshape(-1, 1), Y[train_index])
                score.append(clf.score(tX[test_index].reshape(-1, 1), Y[test_index]))
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
