from pydantic import BaseModel
from pydantic.dataclasses import Field

from studio.app.common.core.algo import AlgoTemplate
from studio.app.common.dataclass import BarData, ScatterData
from studio.app.optinist.core.nwb.nwb import NWBDATASET
from studio.app.optinist.dataclass import BehaviorData, FluoData, IscellData
from studio.app.optinist.wrappers.optinist.utils import standard_norm


class CCAMainParams(BaseModel):
    n_components: int = Field(2)
    scale: bool = Field(True)
    max_iter: int = Field(500)
    tol: float = Field(0.000001)
    copy_data: bool = Field(True, alias="copy")


class CCAParams(BaseModel):
    standard_x_mean: bool = Field(True)
    standard_x_std: bool = Field(True)
    standard_y_mean: bool = Field(True)
    standard_y_std: bool = Field(True)
    transpose_x: bool = Field(True)
    transpose_y: bool = Field(False)
    target_index: int = Field(0)
    CCA: CCAMainParams = Field(CCAMainParams())


class CCA(AlgoTemplate):
    def run(
        self,
        params: CCAParams,
        neural_data: FluoData,
        behaviors_data: BehaviorData,
        iscell: IscellData = None,
    ) -> dict():
        import numpy as np
        from sklearn.cross_decomposition import CCA as SkCCA

        print("start cca:", self.function_id)

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
        tY = standard_norm(Y, params["standard_y_mean"], params["standard_y_std"])

        # calculate CCA
        cca = SkCCA(**params["CCA"])
        projX, projY = cca.fit_transform(tX, tY)

        proj = np.concatenate([projX, projY], axis=1)

        # NWB追加
        nwbfile = {}
        nwbfile[NWBDATASET.POSTPROCESS] = {
            self.function_id: {
                "projectedNd": proj,
                "x_weights": cca.x_weights_,  # singular vectors
                "y_weights": cca.y_weights_,
                "x_loadings_": cca.x_rotations_,
                "y_loadings_": cca.x_rotations_,
                "coef": cca.coef_,
                "n_iter_": cca.n_iter_,
                # 'n_features_in_': [cca.n_features_in_],
            }
        }

        info = {
            "projectedNd": ScatterData(proj, file_name="projectedNd"),
            "coef": BarData(cca.coef_.flatten(), file_name="coef"),
            "nwbfile": nwbfile,
        }

        return info
