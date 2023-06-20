import os
import pandas as pd

from glob import glob
from typing import Optional, Dict, List
from fastapi import APIRouter, status
from fastapi.responses import FileResponse, JSONResponse
from optinist.api.dir_path import DIRPATH

from optinist.api.utils.json_writer import JsonWriter, save_tiff2json
from optinist.api.utils.filepath_creater import create_directory, join_filepath
from optinist.routers.const import ACCEPT_TIFF_EXT
from optinist.routers.fileIO.file_reader import JsonReader, Reader
from optinist.routers.model import JsonTimeSeriesData, OutputData, ImageCreationParams
from optinist.api.dataclass.utils import check_path_format

router = APIRouter()


# NOTE: Not used in "MRIAnalysisStudio".
# @router.get("/outputs/inittimedata/{dirpath:path}", response_model=JsonTimeSeriesData, tags=['outputs'])
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


# NOTE: Not used in "MRIAnalysisStudio".
# @router.get("/outputs/timedata/{dirpath:path}", response_model=JsonTimeSeriesData, tags=['outputs'])
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


# NOTE: Not used in "MRIAnalysisStudio".
# @router.get("/outputs/alltimedata/{dirpath:path}", response_model=JsonTimeSeriesData, tags=['outputs'])
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


# NOTE: Not used in "MRIAnalysisStudio".
# @router.get("/outputs/data/{filepath:path}", response_model=OutputData, tags=['outputs'])
async def get_file(filepath: str):
    return JsonReader.read_as_output(filepath)


# NOTE: Not used in "MRIAnalysisStudio".
# @router.get("/outputs/html/{filepath:path}", response_model=OutputData, tags=['outputs'])
async def get_html(filepath: str):
    return Reader.read_as_output(filepath)


# NOTE: Not used in "MRIAnalysisStudio".
# @router.get("/outputs/image/{filepath:path}", response_model=OutputData, tags=['outputs'])
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


# NOTE: Not used in "MRIAnalysisStudio".
# @router.get("/outputs/csv/{filepath:path}", response_model=OutputData, tags=['outputs'])
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


@router.get('/outputs/nifti_image/{path:path}', response_class=FileResponse, tags=['outputs'])
async def get_nifti_image(path: str):
    """
    Get the image data saved in an NIfTI file.
    """

    # TODO: Get the project path.
    # project_path = get_project_path()
    # Dummy
    project_path = os.path.join(DIRPATH.ROOT_DIR, r'../sample_data/cjs/1')
    file_path = check_path_format(os.path.join(project_path, 'derivatives', path))

    if not os.path.isfile(file_path):
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={'message': f'Image file cannot be found. {file_path}'},
        )

    return FileResponse(
        path=file_path,
        filename=os.path.basename(file_path),
        media_type='image/nifti'
    )


@router.get('/outputs/png_image/{path:path}', response_class=FileResponse, tags=['outputs'])
async def get_png_image(path: str):
    """
    Get the image data saved in a PNG file.
    """

    # TODO: Get the project path.
    # project_path = get_project_path()
    # Dummy
    project_path = os.path.join(DIRPATH.ROOT_DIR, r'../sample_data/cjs/1')
    file_path = check_path_format(os.path.join(project_path, 'derivatives', path))

    if not os.path.isfile(file_path):
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={'message': 'Image file cannot be found.'},
        )

    return FileResponse(
        path=file_path,
        filename=os.path.basename(file_path),
        media_type='image/png'
    )


@router.post('/visualize/generate/{project_id}', response_model=Dict[str, List[str]], tags=['visualize'])
async def generate_stats_images(project_id: str, image_creation_params: ImageCreationParams):
    """
    Send URLs of statistical analysis image files, which were created with the image creation parameters.
    """

    GET_PNG_IMAGE_API = '/outputs/png_image/'

    # TODO: Create a statistical analysis images, and get a list of those URLs. How to get the analysis ID?
    # image_urls = vbm_visualization.create_stats_images(project_id, analysis_id, image_creation_params)
    # Dummy
    dir_path = '3a55fa37/stats_results/'
    file_names = ['Figure_1.png', 'Figure_2.png', 'Figure_3.png']
    image_urls = []
    for file_name in file_names:
        image_urls.append((GET_PNG_IMAGE_API + dir_path + file_name))

    return {'image_urls': image_urls}


@router.post('/visualize/download/{project_id}', response_class=FileResponse, tags=['visualize'])
async def download_stats_report(project_id: str, image_creation_params: ImageCreationParams):
    """
    Send a statistical analysis report saved in the PDF.
    """

    # TODO: Create a statistical analysis report PDF, and get its file path. How to get the analysis ID?
    # file_path = vbm_visualization.create_stats_report_pdf(project_id, analysis_id, image_creation_params)
    # Dummy
    project_path = os.path.join(DIRPATH.ROOT_DIR, r'../sample_data/cjs/1')
    dir_path = 'derivatives/3a55fa37/stats_results/'
    file_name = 'stats_report-1.pdf'
    file_path = check_path_format(os.path.join(project_path, dir_path, file_name))
    # file_path = os.path.join(DIRPATH.ROOT_DIR, r'../sample_data/cjs/1/derivatives/3a55fa37/stats_results/stats_report-1.pdf')

    if not os.path.isfile(file_path):
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={'message': f'Report file cannot be found. {file_path}'},
        )

    return FileResponse(
        path=file_path,
        filename=os.path.basename(file_path),
        media_type='application/pdf'
    )
