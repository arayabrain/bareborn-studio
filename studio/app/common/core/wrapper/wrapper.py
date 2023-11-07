from abc import ABC, abstractmethod
from typing import List

from studio.app.common.core.param.param import Param


class Wrapper(ABC):
    _INPUT_NODES: List[Param] = []
    _OUTPUT_NODES: List[Param] = []
    _DEFAULT_PARAMS: List[Param] = []

    def set_output_dir(self, output_dir: str):
        self.output_dir = output_dir
        self.function_id = output_dir.split("/")[-1]
        return self

    def set_nwb_params(self, nwb_params):
        self.nwb_params = nwb_params
        return self

    @staticmethod
    def docval_params(params: List[Param]):
        return [param.docval_dict() for param in params]

    @staticmethod
    def docval_returns(returns: List[Param]):
        return {
            "returns": ",".join([r.name for r in returns]),
            "rtype": ",".join(
                [
                    ",".join([t.__name__ for t in r.type])
                    if isinstance(r.type, List)
                    else r.type.__name__
                    for r in returns
                ]
            ),
        }

    @abstractmethod
    def func(self, **kwargs):
        pass
