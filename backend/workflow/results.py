import pickle
from collections import OrderedDict
from glob import glob

from wrappers.data_wrapper import *
from cui_api.utils import join_file_path


def get_results(uid, nodeIdList):
    runPaths = []
    for node_id in nodeIdList:
        print(join_file_path([BASE_DIR, uid, node_id, "*.pkl"]))
        for path in glob(join_file_path([BASE_DIR, uid, node_id, "*.pkl"])):
            runPaths.append(path)

    for i, path in enumerate(runPaths):
        runPaths[i] = path.replace("\\", "/")

    print(runPaths)

    results = {}
    for request_path in runPaths:
        node_id = request_path.split("/")[-2]
        algo_name = request_path.split("/")[-1]
        results[node_id] = {}

        with open(request_path, "rb") as f:
            info = pickle.load(f)

        if isinstance(info, list) or isinstance(info, str):
            results[node_id] = get_error(info)
        else:
            json_dir = "/".join(request_path.split("/")[:-1])
            results[node_id] = get_success(info, algo_name, json_dir)

    return results


def get_error(info):
    if isinstance(info, str):
        error_message = info
    else:
        error_message = "¥n".join(info)
    message = {
        "status": "error",
        "message": error_message,
    }
    return message


def get_success(info, algo_name, json_dir):
    message = {
        "status": "success",
        "message": algo_name + " success",
        "outputPaths": get_outputPaths(info, json_dir)
    }
    return message


def get_outputPaths(info, json_dir):
    outputPaths = {}
    for k, v in info.items():
        if isinstance(v, BaseData):
            v.save_json(json_dir)

        if isinstance(v, ImageData):
            outputPaths[k] = {}
            outputPaths[k]['path'] = v.json_path
            outputPaths[k]['type'] = 'images'
            if v.data.ndim == 3:
                outputPaths[k]['max_index'] = len(v.data)
            elif v.data.ndim == 2:
                outputPaths[k]['max_index'] = 1
        elif isinstance(v, TimeSeriesData):
            outputPaths[k] = {}
            outputPaths[k]['path'] = v.json_path
            outputPaths[k]['type'] = 'timeseries'
            outputPaths[k]['max_index'] = len(v.data)
        elif isinstance(v, CorrelationData):
            outputPaths[k] = {}
            outputPaths[k]['path'] = v.json_path
            outputPaths[k]['type'] = 'heatmap'
        elif isinstance(v, RoiData):
            outputPaths[k] = {}
            outputPaths[k]['path'] = v.json_path
            outputPaths[k]['type'] = 'roi'
        elif isinstance(v, ScatterData):
            outputPaths[k] = {}
            outputPaths[k]['path'] = v.json_path
            outputPaths[k]['type'] = 'scatter'
        elif isinstance(v, BarData):
            outputPaths[k] = {}
            outputPaths[k]['path'] = v.json_path
            outputPaths[k]['type'] = 'bar'
        else:
            pass

    return outputPaths