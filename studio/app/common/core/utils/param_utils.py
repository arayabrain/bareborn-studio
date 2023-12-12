import inspect
from typing import Any, Dict, _GenericAlias

from pydantic import BaseModel

from studio.app.common.core.algo import AlgoTemplate
from studio.app.common.schemas.params import SnakemakeParams
from studio.app.optinist.schemas.nwb import NWBParams
from studio.app.wrappers import wrapper_dict


def find_algo_by_name(
    name: str,
    wrapper_dict: Dict[str, Any] = wrapper_dict,
) -> AlgoTemplate:
    for k, v in wrapper_dict.items():
        if isinstance(v, dict) and "function" not in v:
            algo = find_algo_by_name(name, v)
            if algo is not None:
                return algo
        elif k == name:
            return v["function"]
    return None


def get_default_params(name: str):
    if name == "nwb":
        return NWBParams
    elif name == "snakemake":
        return SnakemakeParams
    else:
        algo = find_algo_by_name(name)
        if algo is None:
            return None
        else:
            sig = inspect.signature(algo.run)
            return sig.parameters.get("params").annotation


def get_param_map(params, path=None):
    default_params = {}

    for k, v in params.__fields__.items():
        k = k if v.field_info.alias is None else v.field_info.alias
        if issubclass(type(v.default), BaseModel):
            default_params[k] = {
                "type": "parent",
                "children": get_param_map(
                    params=v.default,
                    path=k if path is None else f"{path}/{k}",
                ),
            }
        else:
            default_params[k] = {
                "type": "child",
                "dataType": type(v.default).__name__
                if isinstance(v.annotation, _GenericAlias)
                else v.annotation.__name__,
                "value": v.default,
                "doc": v.field_info.description,
                "path": k if path is None else f"{path}/{k}",
            }

    return default_params


def get_typecheck_params(message_params, name):
    default_params = get_default_params(name)
    if message_params != {} and message_params is not None:
        return default_params(**nest2dict(message_params)).dict(by_alias=True)
    else:
        return default_params().dict(by_alias=True)


def nest2dict(value):
    nwb_dict = {}
    for _k, _v in value.items():
        if _v["type"] == "child":
            nwb_dict[_k] = _v["value"]
        elif _v["type"] == "parent":
            nwb_dict[_k] = nest2dict(_v["children"])

    return nwb_dict
