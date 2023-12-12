from abc import ABC, abstractmethod


class AlgoTemplate(ABC):
    def set_output_dir(self, output_dir: str):
        self.output_dir = output_dir
        self.function_id = output_dir.split("/")[-1]
        return self

    def set_nwb_params(self, nwb_params):
        self.nwb_params = nwb_params
        return self

    @abstractmethod
    def run(self, params):
        pass
