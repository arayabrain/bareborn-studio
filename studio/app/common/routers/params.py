from typing import Dict, Union

from fastapi import APIRouter, HTTPException

from studio.app.common.core.utils.param_utils import get_default_params, get_param_map
from studio.app.common.schemas.params import ParamChild, ParamParent, SnakemakeParams

router = APIRouter(tags=["params"])


@router.get("/params/{name}", response_model=Dict[str, Union[ParamChild, ParamParent]])
async def get_params(name: str) -> dict:
    default_params = get_default_params(name)
    if default_params is None:
        raise HTTPException(status_code=404, detail=f"Algo with name {name} not found")

    return get_param_map(default_params)


@router.get("/snakemake", response_model=Dict[str, Union[ParamChild, ParamParent]])
async def get_snakemake_params():
    return get_param_map(SnakemakeParams)
