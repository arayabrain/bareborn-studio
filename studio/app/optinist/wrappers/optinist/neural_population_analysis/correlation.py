from pydantic import BaseModel
from pydantic.dataclasses import Field

from studio.app.common.core.algo import AlgoTemplate
from studio.app.common.dataclass import HeatMapData
from studio.app.optinist.core.nwb.nwb import NWBDATASET
from studio.app.optinist.dataclass import FluoData, IscellData


class CorrelationParams(BaseModel):
    transpose: bool = Field(True)


class Correlation(AlgoTemplate):
    def run(
        self,
        params: CorrelationParams,
        neural_data: FluoData,
        iscell: IscellData = None,
    ) -> dict():
        import numpy as np

        print("start correlation:", self.function_id)

        neural_data = neural_data.data

        # data should be time x component matrix
        if params["transpose"]:
            X = neural_data.transpose()
        else:
            X = neural_data

        if iscell is not None:
            iscell = iscell.data
            ind = np.where(iscell > 0)[0]
            X = X[ind, :]

        num_cell = X.shape[0]

        # calculate correlation
        corr = np.corrcoef(X)
        for i in range(num_cell):
            corr[i, i] = np.nan

        # NWB追加
        nwbfile = {}
        nwbfile[NWBDATASET.POSTPROCESS] = {
            self.function_id: {
                "corr": corr,
            }
        }

        info = {
            "corr": HeatMapData(corr, file_name="corr"),
            "nwbfile": nwbfile,
        }

        return info
