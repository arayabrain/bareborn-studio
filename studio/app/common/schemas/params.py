from typing import Any, Dict, Optional, Union

from pydantic import BaseModel
from pydantic.dataclasses import Field


class ParamChild(BaseModel):
    type: str = "child"
    dataType: str
    value: Any
    path: str
    doc: Optional[str] = None


class ParamParent(BaseModel):
    type: str = "parent"
    children: Dict[str, Union[ParamChild, "ParamParent"]]


class SnakemakeParams(BaseModel):
    use_conda: bool = Field(True)
    cores: int = Field(2)
    forceall: bool = Field(False)
    forcetargets: bool = Field(True)
    lock: bool = Field(False)
