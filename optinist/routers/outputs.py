import os
import pandas as pd
from glob import glob
from typing import Optional, Dict
from fastapi import APIRouter
from fastapi.responses import FileResponse
from optinist.api.dir_path import DIRPATH

from optinist.api.utils.json_writer import JsonWriter, save_tiff2json
from optinist.api.utils.filepath_creater import create_directory, join_filepath
from optinist.routers.const import ACCEPT_TIFF_EXT
from optinist.routers.fileIO.file_reader import JsonReader, Reader
from optinist.routers.model import JsonTimeSeriesData, OutputData, ImageCreationParams
from optinist.wrappers.vbm_wrapper import vbm_visualization


router = APIRouter()


@router.get("/outputs/inittimedata/{dirpath:path}", response_model=JsonTimeSeriesData, tags=['outputs'])
async def get_inittimedata(dirpath: str):
    file_numbers = sorted([
        os.path.splitext(os.path.basename(x))[0]
        for x in glob(join_filepath([dirpath, '*.json']))
    ])

    index = file_numbers[0]
    str_index = str(index)

    json_data = JsonReader.read_as_timeseries(
        join_filepath([dirpath, f'{str(index)}.json'])
    )

    return_data = JsonTimeSeriesData(
        xrange=[],
        data={},
        std={},
    )

    data = {
        str(i): {
            json_data.xrange[0]: json_data.data[json_data.xrange[0]]
        }
        for i in file_numbers
    }

    if json_data.std is not None:
        std = {
            str(i): {
                json_data.xrange[0]: json_data.data[json_data.xrange[0]]
            }
            for i in file_numbers
        }

    return_data = JsonTimeSeriesData(
        xrange=json_data.xrange,
        data=data,
        std=std if json_data.std is not None else {},
    )

    return_data.data[str_index] = json_data.data
    if json_data.std is not None:
        return_data.std[str_index] = json_data.std

    return return_data


@router.get("/outputs/timedata/{dirpath:path}", response_model=JsonTimeSeriesData, tags=['outputs'])
async def get_timedata(dirpath: str, index: int):
    json_data = JsonReader.read_as_timeseries(
        join_filepath([
            dirpath,
            f'{str(index)}.json'
        ])
    )

    return_data = JsonTimeSeriesData(
        xrange=[],
        data={},
        std={},
    )

    str_index = str(index)
    return_data.data[str_index] = json_data.data
    if json_data.std is not None:
        return_data.std[str_index] = json_data.std

    return return_data


@router.get("/outputs/alltimedata/{dirpath:path}", response_model=JsonTimeSeriesData, tags=['outputs'])
async def get_alltimedata(dirpath: str):
    return_data = JsonTimeSeriesData(
        xrange=[],
        data={},
        std={},
    )

    for i, path in enumerate(glob(join_filepath([dirpath, '*.json']))):
        str_idx = str(os.path.splitext(os.path.basename(path))[0])
        json_data = JsonReader.read_as_timeseries(path)
        if i == 0:
            return_data.xrange = json_data.xrange

        return_data.data[str_idx] = json_data.data
        if json_data.std is not None:
            return_data.std[str_idx] = json_data.std

    return return_data


@router.get("/outputs/data/{filepath:path}", response_model=OutputData, tags=['outputs'])
async def get_file(filepath: str):
    return JsonReader.read_as_output(filepath)


@router.get("/outputs/html/{filepath:path}", response_model=OutputData, tags=['outputs'])
async def get_html(filepath: str):
    return Reader.read_as_output(filepath)


@router.get("/outputs/image/{filepath:path}", response_model=OutputData, tags=['outputs'])
async def get_image(
        filepath: str,
        start_index: Optional[int] = 0,
        end_index: Optional[int] = 1
    ):
    filename, ext = os.path.splitext(os.path.basename(filepath))
    if ext in ACCEPT_TIFF_EXT:
        filepath = join_filepath([DIRPATH.INPUT_DIR, filepath])
        save_dirpath = join_filepath([
            os.path.dirname(filepath),
            filename,
        ])
        json_filepath = join_filepath([
            save_dirpath,
            f'{filename}_{str(start_index)}_{str(end_index)}.json'
        ])
        if not os.path.exists(json_filepath):
            save_tiff2json(filepath, save_dirpath, start_index, end_index)
    else:
        json_filepath = filepath

    return JsonReader.read_as_output(json_filepath)


@router.get("/outputs/csv/{filepath:path}", response_model=OutputData, tags=['outputs'])
async def get_csv(filepath: str):
    filepath = join_filepath([DIRPATH.INPUT_DIR, filepath])

    filename, _ = os.path.splitext(os.path.basename(filepath))
    save_dirpath = join_filepath([
        os.path.dirname(filepath),
        filename
    ])
    create_directory(save_dirpath)
    json_filepath = join_filepath([
        save_dirpath,
        f'{filename}.json'
    ])

    JsonWriter.write_as_split(
        json_filepath,
        pd.read_csv(filepath, header=None)
    )
    return JsonReader.read_as_output(json_filepath)


@router.put('/visualize/generate/{project_id}', tags=['visualize'])
async def visualize_generate(project_id: str, image_creation_params: ImageCreationParams) -> Dict[str, str]:
    """
    Generate images of the statistical analysis results based on the image creation parameters,
    save those images in an image file or PDF, and send the URL.
    """

    image_urls = vbm_visualization.generate_stats_images(project_id, image_creation_params)

    return {'image_urls': image_urls}


@router.put('/visualize/download/{project_id}', response_class=FileResponse, tags=['visualize'])
async def visualize_download(project_id: str, image_creation_params: ImageCreationParams):
    # Dummy
    dir_path = os.path.dirname(__file__)
    file_name = 'stats_results-230601_123456-1.pdf'
    file_path = os.path.join(dir_path, r'../test_data/cjs/output/3a55fa37/stats_results', file_name)

    response = FileResponse(
        path=file_path,
        filename=file_name
    )

    return response


# if __name__ == "__main__":
#     params = ImageCreationParams(threshold=[1.23, 4.56], cut_coords=[[1, 2, 3], [4, 5, 6], [7, 8, 9]])
#     response = visualize_download('abcde', params)
#     print(response)
