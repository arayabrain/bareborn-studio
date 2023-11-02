from dataclasses import asdict

from studio.app.common.core.param.param import ParamChild, ParamParent
from studio.app.common.core.snakemake.smk import SnakemakeParams
from studio.app.common.core.wrapper.wrapper_utils import WrapperUtils
from studio.app.optinist.core.nwb.nwb import NWBParams


class ParamUtils:
    @classmethod
    def get_default_params(cls, name):
        if name == "snakemake":
            params = SnakemakeParams.PARAMS
        elif name == "nwb":
            params = NWBParams.PARAMS
        else:
            wrapper = WrapperUtils.find_wrapper_by_name(name=name)
            if wrapper is None:
                return None
            params = wrapper._DEFAULT_PARAMS

        result = {}
        for param in params:
            if param.section is None:
                result[param.name] = param.json_dict()
            else:
                sections = param.section.split("/")
                current_section = result
                for section in sections:
                    if section not in current_section:
                        current_section[section] = {"type": "parent", "children": {}}
                    current_section = current_section[section]["children"]
                else:
                    current_section[param.name] = param.json_dict()
        return result

    @classmethod
    def merge_params(cls, source, destination):
        for key, value in source.items():
            if key in destination:
                if isinstance(value, dict):
                    cls.merge_params(value, destination[key])
                else:
                    destination[key] = value
            else:
                destination[key] = value
        return destination

    @classmethod
    def convert_to_plane_dict(cls, params):
        for k, v in params.items():
            if isinstance(v, ParamParent):
                params[k] = {
                    "type": "parent",
                    "children": cls.convert_to_plane_dict(v.children),
                }
            elif isinstance(v, ParamChild):
                params[k] = asdict(v)
        return params

    @classmethod
    def get_type_fixed_params(cls, params, name):
        default_params = cls.get_default_params(name)
        if params != {} and params is not None:
            params = cls.merge_params(params, default_params)
            return cls.fix_param_value_type(params)
        else:
            return default_params

    @classmethod
    def fix_param_value_type(cls, params):
        for k, v in params.items():
            if v["type"] == "parent":
                params[k]["children"] = cls.fix_param_value_type(v["children"])
            if v["type"] == "child" and v["value"] is not None:
                if v["dataType"] == "str":
                    v["value"] = str(v["value"])
                elif v["dataType"] == "int":
                    v["value"] = int(v["value"])
                elif v["dataType"] == "float":
                    v["value"] = float(v["value"])
                elif v["dataType"] == "bool":
                    v["value"] = bool(v["value"])
        return params

    @classmethod
    def get_key_value_params(cls, params):
        key_value_params = {}
        for k, v in params.items():
            if v["type"] == "parent":
                key_value_params[k] = cls.get_key_value_params(v["children"])
            elif v["type"] == "child":
                key_value_params[k] = v["value"]
        return key_value_params

    @classmethod
    def get_flatten_params(cls, params):
        flatten_params = {}
        for k, v in params.items():
            if isinstance(v, dict):
                flatten_params.update(cls.get_flatten_params(v))
            else:
                flatten_params[k] = v
        return flatten_params
