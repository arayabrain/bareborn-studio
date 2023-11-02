from typing import Dict, Optional, Union

from pydantic.dataclasses import dataclass

from studio.app.common.core.param.param import ParamChild, ParamParent
from studio.app.common.core.workflow.workflow import OutputPath


@dataclass
class ExptFunction:
    unique_id: str
    name: str
    success: str
    hasNWB: bool
    message: Optional[str] = None
    outputPaths: Optional[Dict[str, OutputPath]] = None
    started_at: Optional[str] = None
    finished_at: Optional[str] = None


@dataclass
class ExptConfig:
    workspace_id: str
    unique_id: str
    name: str
    started_at: str
    finished_at: Optional[str]
    success: Optional[str]
    hasNWB: bool
    function: Dict[str, ExptFunction]
    nwb: Dict[str, Union[ParamChild, ParamParent]]
    snakemake: Dict[str, Union[ParamChild, ParamParent]]
