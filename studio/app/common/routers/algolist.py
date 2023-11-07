from typing import Dict, List

from fastapi import APIRouter

from studio.app.common.core.param.param import Param
from studio.app.common.core.wrapper.wrapper import Wrapper
from studio.app.common.schemas.algolist import Algo, AlgoList, Arg, Return
from studio.app.const import FUNC_KEY
from studio.app.wrappers import wrapper_dict

router = APIRouter()


class NestDictGetter:
    @classmethod
    def get_nest_dict(cls, parent_value, parent_key: str) -> AlgoList:
        algo_dict = {}
        for key, value in parent_value.items():
            algo_dict[key] = {}
            if isinstance(value, dict) and FUNC_KEY not in value:
                algo_dict[key]["children"] = cls.get_nest_dict(
                    value, cls._parent_key(parent_key, key)
                )
            else:
                wrapper: Wrapper = value[FUNC_KEY]

                algo_dict[key] = Algo(
                    args=cls._args_list(wrapper._INPUT_NODES),
                    returns=cls._return_list(wrapper._OUTPUT_NODES),
                    path=cls._parent_key(parent_key, key),
                )

        return algo_dict

    @classmethod
    def _args_list(cls, arg_params: List[Param]) -> List[Arg]:
        return [
            Arg(name=x.name, type=x.type.__name__, isNone=x.is_none) for x in arg_params
        ]

    @classmethod
    def _return_list(cls, return_params: List[Param]) -> List[Return]:
        return [Return(name=x.name, type=x.type.__name__) for x in return_params]

    @classmethod
    def _parent_key(cls, parent_key: str, key: str) -> str:
        if parent_key == "":
            return key
        else:
            return f"{parent_key}/{key}"


@router.get("/algolist", response_model=AlgoList, tags=["others"])
async def get_algolist() -> Dict[str, Algo]:
    """_summary_

    Returns:
        {
            'caiman': {
                'children': {
                    'caiman_mc' : {
                        'args': ['images', 'timeseries'],
                        'return': ['images'],
                        'path': 'caiman/caiman_mc'
                    },
                    'caiman_cnmf': {
                        'args': ['images', 'timeseries'],
                        'return': ['images'],
                        'path': 'caiman/caiman_mc'
                    }
                }
            }
        }
    """

    return NestDictGetter.get_nest_dict(wrapper_dict, "")
