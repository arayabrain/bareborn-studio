from typing import Any, Dict

from studio.app.common.core.wrapper.algo import AlgoTemplate
from studio.app.const import FUNC_KEY
from studio.app.wrappers import wrapper_dict


class AlgoUtils:
    @classmethod
    def find_algo_by_name(
        cls,
        name: str,
        wrapper_dict: Dict[str, Any] = wrapper_dict,
    ) -> AlgoTemplate:
        if name in wrapper_dict:
            return wrapper_dict[name][FUNC_KEY]
        else:
            for v in wrapper_dict.values():
                if isinstance(v, dict) and FUNC_KEY not in v:
                    return cls.find_algo_by_name(name, v)
        return None
