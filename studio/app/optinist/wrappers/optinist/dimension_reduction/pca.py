from pydantic import BaseModel
from pydantic.dataclasses import Field

from studio.app.common.core.algo import AlgoTemplate
from studio.app.common.dataclass import BarData, ScatterData
from studio.app.optinist.core.nwb.nwb import NWBDATASET
from studio.app.optinist.dataclass import FluoData, IscellData
from studio.app.optinist.wrappers.optinist.utils import standard_norm


class PCAMainParams(BaseModel):
    n_components: int = Field(2)
    copy_data: bool = Field(True, alias="copy")
    whiten: bool = Field(False)
    svd_solver: str = Field("auto")
    tol: float = Field(0.0)
    iterated_power: str = Field("auto")
    # random_state: int = Field(0)


class PCAParams(BaseModel):
    standard_mean: bool = Field(True)
    standard_std: bool = Field(True)
    transpose: bool = Field(True)
    PCA: PCAMainParams = Field(PCAMainParams())


class PCA(AlgoTemplate):
    def run(
        self,
        params: PCAParams,
        neural_data: FluoData,
        iscell: IscellData = None,
    ) -> dict():
        # modules specific to function
        import numpy as np
        from sklearn.decomposition import PCA

        print("start PCA:", self.function_id)

        neural_data = neural_data.data

        # data should be time x component matrix
        if params["transpose"]:
            X = neural_data.transpose()
        else:
            X = neural_data

        if iscell is not None:
            iscell = iscell.data
            ind = np.where(iscell > 0)[0]
            X = X[:, ind]

        # # preprocessing
        tX = standard_norm(X, params["standard_mean"], params["standard_std"])

        # calculate PCA
        pca = PCA(**params["PCA"])
        proj_X = pca.fit_transform(tX)

        # NWB追加
        nwbfile = {}
        nwbfile[NWBDATASET.POSTPROCESS] = {
            self.function_id: {
                "pca_projectedNd": proj_X,
                "components": pca.components_,
                "explained_variance": pca.explained_variance_,
                "explained_variance_ratio": pca.explained_variance_ratio_,
                "singular_values": pca.singular_values_,
                "mean": pca.mean_,
                "n_components": [pca.n_components_],
                "n_samples": [pca.n_samples_],
                "noise_variance": [pca.noise_variance_],
                "n_features_in": [pca.n_features_in_],
            }
        }

        # import pdb; pdb.set_trace()
        info = {
            "explained_variance": BarData(
                pca.explained_variance_ratio_, file_name="evr"
            ),
            "projectedNd": ScatterData(proj_X, file_name="projectedNd"),
            "contribution": BarData(
                pca.components_,
                index=[f"pca: {i}" for i in range(len(pca.components_))],
                file_name="contribution",
            ),
            "cumsum_contribution": BarData(
                np.cumsum(pca.components_, axis=0),
                index=[f"pca: {i}" for i in range(len(pca.components_))],
                file_name="cumsum_contribution",
            ),
            "nwbfile": nwbfile,
        }

        return info
