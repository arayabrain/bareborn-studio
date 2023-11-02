from typing import Dict, List, Union

from pydantic import BaseModel, Field
from pydantic.dataclasses import dataclass

from studio.app.common.core.param.param import Param


@dataclass
class Rule:
    input: list
    return_arg: Union[str, Dict[str, str]]
    params: dict
    output: str
    type: str
    nwbfile: dict = None
    hdf5Path: str = None
    path: str = None


@dataclass
class FlowConfig:
    rules: Dict[str, Rule]
    last_output: list


class ForceRun(BaseModel):
    nodeId: str
    name: str


@dataclass
class SmkParam:
    use_conda: bool
    cores: int
    forceall: bool
    forcetargets: bool
    lock: bool
    forcerun: List[ForceRun] = Field(default_factory=list)


class SnakemakeParams:
    PARAMS = [
        Param(name="use_conda", type=bool, default=True),
        Param(name="cores", type=int, default=2),
        Param(name="forceall", type=bool, default=False),
        Param(name="forcetargets", type=bool, default=True),
        Param(name="lock", type=bool, default=False),
    ]
