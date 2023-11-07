from typing import Dict, Union

import yaml

from studio.app.common.core.experiment.experiment import ExptConfig, ExptFunction
from studio.app.common.core.param.param import ParamChild, ParamParent
from studio.app.common.core.param.param_utils import ParamUtils
from studio.app.common.core.workflow.workflow import OutputPath
from studio.app.const import FUNC_KEY


class ExptConfigReader:
    @classmethod
    def read(cls, filepath) -> ExptConfig:
        with open(filepath, "r") as f:
            config = yaml.safe_load(f)

        return ExptConfig(
            workspace_id=config["workspace_id"],
            unique_id=config["unique_id"],
            name=config["name"],
            started_at=config["started_at"],
            finished_at=config.get("finished_at"),
            success=config.get("success", "running"),
            hasNWB=config["hasNWB"],
            function=cls.read_function(config[FUNC_KEY]),
            nwb=cls.read_params(config.get("nwb"), "nwb"),
            snakemake=cls.read_params(config.get("snakemake"), "snakemake"),
        )

    @classmethod
    def read_params(cls, config, kind) -> Dict[str, Union[ParamChild, ParamParent]]:
        default_params = ParamUtils.get_default_params(kind)
        try:
            # NOTE: older version params has differernt format
            assert (
                isinstance(list(config.items())[0][1], dict)
                and "type" in list(config.items())[0][1]
            )
            return ParamUtils.merge_params(config, default_params)
        except AssertionError:
            param_tree = cls.convert_to_param_tree(config)
            return ParamUtils.merge_params(param_tree, default_params)

    @classmethod
    def convert_to_param_tree(cls, config):
        """
        This function is for converting older version params to new version params.
        Strictly speaking, new version has other attributes like doc, dataType.
        But, these values are not updated by user and filled by merge_params function.
        So we don't need to add them here.
        - older version format
            {
                "param1": "value1",
                "section1": {
                    "param2": "value2",
                }
            }
        - new version format
            {
                "param1": {
                    "type": "child",
                    "value": "value1"
                },
                "section1": {
                    "type": "parent",
                    "children": {
                        "param2": {
                            "type": "child",
                            "value": "value2"
                        }
                    }
                }
            }
        """
        for k, v in config.items():
            if isinstance(v, dict):
                config[k] = {
                    "children": cls.convert_to_param_tree(v),
                    "type": "parent",
                }
            else:
                config[k] = {"type": "child", "value": v}
        return config

    @classmethod
    def read_function(cls, config) -> Dict[str, ExptFunction]:
        return {
            key: ExptFunction(
                unique_id=value["unique_id"],
                name=value["name"],
                started_at=value.get("started_at"),
                finished_at=value.get("finished_at"),
                success=value.get("success", "running"),
                hasNWB=value["hasNWB"],
                message=value.get("message"),
                outputPaths=cls.read_output_paths(value.get("outputPaths")),
            )
            for key, value in config.items()
        }

    @classmethod
    def read_output_paths(cls, config) -> Dict[str, OutputPath]:
        if config:
            return {
                key: OutputPath(
                    path=value["path"],
                    type=value["type"],
                    max_index=value["max_index"],
                )
                for key, value in config.items()
            }
        else:
            return None

    @classmethod
    def rename(cls, filepath, new_name: str) -> ExptConfig:
        with open(filepath, "r") as f:
            config = yaml.safe_load(f)
            config["name"] = new_name

        with open(filepath, "w") as f:
            yaml.dump(config, f)

        return ExptConfig(
            workspace_id=config["workspace_id"],
            unique_id=config["unique_id"],
            name=config["name"],
            started_at=config.get("started_at"),
            finished_at=config.get("finished_at"),
            success=config.get("success", "running"),
            hasNWB=config["hasNWB"],
            function=cls.read_function(config[FUNC_KEY]),
            nwb=config.get("nwb"),
            snakemake=config.get("snakemake"),
        )
