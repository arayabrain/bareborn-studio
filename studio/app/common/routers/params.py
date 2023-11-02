from typing import Dict, Union

from fastapi import APIRouter

from studio.app.common.core.param.param import ParamChild, ParamParent
from studio.app.common.core.param.param_utils import ParamUtils

router = APIRouter(tags=["params"])


@router.get("/params/{name}", response_model=Dict[str, Union[ParamChild, ParamParent]])
async def get_params(name: str):
    return ParamUtils.get_default_params(name)


@router.get("/snakemake", response_model=Dict[str, Union[ParamChild, ParamParent]])
async def get_snakemake_params():
    return ParamUtils.get_default_params("snakemake")
