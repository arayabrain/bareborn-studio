from typing import List

from pydantic import BaseModel


class CutCoordParam(BaseModel):
    coronal: List[int] = []
    sagittal: List[int] = []
    horizontal: List[int] = []


class StatImageParam(BaseModel):
    threshold: List[int] = [0, 0]
    cut_coords: CutCoordParam = CutCoordParam()
