from typing import Dict

import yaml

from studio.app.common.core.param.param_utils import ParamUtils
from studio.app.common.core.workflow.workflow import (
    Edge,
    Node,
    NodeData,
    NodePosition,
    Style,
)
from studio.app.common.schemas.workflow import WorkflowConfig


class WorkflowConfigReader:
    @classmethod
    def read(cls, filepath) -> WorkflowConfig:
        with open(filepath, "r") as f:
            config = yaml.safe_load(f)

        return WorkflowConfig(
            nodeDict=cls.read_nodeDict(config["nodeDict"]),
            edgeDict=cls.read_edgeDict(config["edgeDict"]),
        )

    @classmethod
    def read_binary(cls, file) -> WorkflowConfig:
        return WorkflowConfig(
            nodeDict=cls.read_nodeDict(file["nodeDict"]),
            edgeDict=cls.read_edgeDict(file["edgeDict"]),
        )

    @classmethod
    def read_nodeDict(cls, config) -> Dict[str, Node]:
        return {
            key: Node(
                id=key,
                type=value["type"],
                data=cls.read_nodeData(value["data"]),
                position=NodePosition(**value["position"]),
                style=Style(**value["style"]),
            )
            for key, value in config.items()
        }

    @classmethod
    def read_nodeData(cls, config) -> Dict[str, NodeData]:
        default_params = (
            ParamUtils.get_default_params(config["label"])
            if config["type"] == "algorithm"
            else None
        )

        if default_params is not None:
            return NodeData(
                label=config["label"],
                path=config["path"],
                type=config["type"],
                param=ParamUtils.merge_params(config["param"], default_params),
                fileType=config.get("fileType"),
                hdf5Path=config.get("hdf5Path"),
            )
        else:
            return NodeData(
                label=config["label"],
                path=config["path"],
                type=config["type"],
                param=config["param"],
                fileType=config.get("fileType"),
                hdf5Path=config.get("hdf5Path"),
            )

    @classmethod
    def read_edgeDict(cls, config) -> Dict[str, Edge]:
        return {
            key: Edge(
                id=key,
                type=value["type"],
                animated=value["animated"],
                source=value["source"],
                sourceHandle=value["sourceHandle"],
                target=value["target"],
                targetHandle=value["targetHandle"],
                style=Style(**value["style"]),
            )
            for key, value in config.items()
        }
