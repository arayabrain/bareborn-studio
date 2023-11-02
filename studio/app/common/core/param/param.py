from typing import Any, Dict, List, Optional, Union

from pydantic.dataclasses import dataclass


@dataclass
class ParamChild:
    path: str
    value: Any
    dataType: Optional[Union[str, List]] = None
    doc: Optional[str] = None
    type: str = "child"


@dataclass
class ParamParent:
    children: Dict[str, Union["ParamParent", ParamChild]]
    type: str = "parent"


class Param:
    def __init__(
        self,
        name: str,
        type: Union[type, List[type]],
        doc: Optional[str] = None,
        section: Optional[str] = None,
        **kwargs,
    ):
        self.name = name
        self.type = type
        self.doc = doc
        self.section = section
        if "default" in kwargs:
            self.default = kwargs["default"]

    @property
    def is_none(self):
        if "default" in self.__dict__:
            return self.default is None
        else:
            return False

    def docval_dict(self):
        docval_dict = {
            "name": self.name,
            "type": tuple(self.type) if isinstance(self.type, List) else self.type,
            "doc": self.doc,
        }
        if "default" in self.__dict__:
            docval_dict["default"] = self.default
        return docval_dict

    def json_dict(self):
        json_dict = {
            "dataType": [t.__name__ for t in self.type]
            if isinstance(self.type, List)
            else self.type.__name__,
            "doc": self.doc,
            "path": self.name
            if self.section is None
            else f"{self.section}/{self.name}",
            "type": "child",
            "value": self.default if "default" in self.__dict__ else None,
        }
        return json_dict
