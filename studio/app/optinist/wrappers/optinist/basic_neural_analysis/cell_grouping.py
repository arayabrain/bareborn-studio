from pydantic import BaseModel
from pydantic.dataclasses import Field

from studio.app.common.core.algo import AlgoTemplate
from studio.app.common.dataclass import TimeSeriesData


class CellGroupingParams(BaseModel):
    transpose: bool = Field(False)
    threshold: float = Field(1.0)
    start_time: int = Field(-10)
    end_time: int = Field(0)


class CellGrouping(AlgoTemplate):
    def run(self, params: CellGroupingParams, neural_data: TimeSeriesData) -> dict():
        import numpy as np

        neural_data = neural_data.data
        std = neural_data.std

        if params["transpose"]:
            neural_data = neural_data.transpose()

        baseline = np.mean(neural_data, axis=1, keepdims=True)
        std = neural_data[np.argmax(neural_data, axis=1)].std()

        grouped_cells = (neural_data.max(axis=1) - baseline) / std > params["threshold"]

        info = {}
        info["grouped_cells"] = TimeSeriesData(
            neural_data[grouped_cells], std=std, file_name="grouped_cells_mean"
        )

        return info
