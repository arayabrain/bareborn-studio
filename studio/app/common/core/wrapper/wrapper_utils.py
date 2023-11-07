from typing import Any, Dict

from studio.app.common.core.wrapper.wrapper import Wrapper
from studio.app.const import FUNC_KEY
from studio.app.wrappers import wrapper_dict


class WrapperUtils:
    @classmethod
    def find_wrapper_by_name(
        cls,
        name: str,
        wrapper_dict: Dict[str, Any] = wrapper_dict,
    ) -> Wrapper:
        if name in wrapper_dict:
            return wrapper_dict[name][FUNC_KEY]
        else:
            for v in wrapper_dict.values():
                if isinstance(v, dict) and FUNC_KEY not in v:
                    return cls.find_wrapper_by_name(name, v)
        return None
