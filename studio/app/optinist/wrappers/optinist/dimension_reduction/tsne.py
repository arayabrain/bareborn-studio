from pydantic import BaseModel
from pydantic.dataclasses import Field

from studio.app.common.core.algo import AlgoTemplate
from studio.app.common.dataclass import ScatterData
from studio.app.optinist.core.nwb.nwb import NWBDATASET
from studio.app.optinist.dataclass import FluoData, IscellData
from studio.app.optinist.wrappers.optinist.utils import standard_norm


class TSNEMainParams(BaseModel):
    n_components: int = Field(2)
    perplexity: float = Field(30.0)
    early_exaggeration: float = Field(12.0)
    learning_rate: str = Field("warn")
    n_iter: int = Field(1000)
    n_iter_without_progress: int = Field(300)
    min_grad_norm: float = Field(0.0000001)
    metric: str = Field("euclidean")
    init: str = Field("warn")
    random_state: int = Field(0)
    method: str = Field("barnes_hut")
    angle: float = Field(0.5)
    n_jobs: int = Field(1)
    square_distances: str = Field("legacy")


class TSNEParams(BaseModel):
    standard_mean: bool = Field(True)
    standard_std: bool = Field(True)
    transpose: bool = Field(True)
    TSNE: TSNEMainParams = Field(TSNEMainParams())


class TSNE(AlgoTemplate):
    def run(
        self,
        params: TSNEParams,
        neural_data: FluoData,
        iscell: IscellData = None,
    ) -> dict():
        import numpy as np
        from sklearn.manifold import TSNE

        print("start TSNE:", self.function_id)

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

        # preprocessing
        tX = standard_norm(X, params["standard_mean"], params["standard_std"])

        # calculate TSNE
        tsne = TSNE(**params["TSNE"])

        proj_X = tsne.fit_transform(tX)

        # NWB追加
        nwbfile = {}
        nwbfile[NWBDATASET.POSTPROCESS] = {self.function_id: {"projectedNd": proj_X}}

        info = {
            "projectedNd": ScatterData(proj_X, file_name="projectedNd"),
            "nwbfile": nwbfile,
        }

        return info
