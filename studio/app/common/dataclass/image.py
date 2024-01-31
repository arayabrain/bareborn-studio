import gc
import math
import os
from typing import Optional

import imageio
import numpy as np
import tifffile

from studio.app.common.core.utils.filepath_creater import (
    create_directory,
    join_filepath,
)
from studio.app.common.core.utils.json_writer import JsonWriter
from studio.app.common.core.workflow.workflow import OutputPath, OutputType
from studio.app.common.dataclass.base import BaseData
from studio.app.common.dataclass.utils import create_images_list
from studio.app.common.schemas.outputs import PlotMetaData
from studio.app.const import MAXIMUM_IMAGE_DATA_PART_SIZE
from studio.app.dir_path import DIRPATH


class ImageData(BaseData):
    def __init__(
        self,
        data,
        output_dir=DIRPATH.OUTPUT_DIR,
        file_name="image",
        meta: Optional[PlotMetaData] = None,
    ):
        super().__init__(file_name)

        self.json_path = None
        self.meta = meta

        if data is None:
            self.path = None
        elif isinstance(data, str):
            size = os.path.getsize(data)

            if size <= MAXIMUM_IMAGE_DATA_PART_SIZE:
                self.path = data
            else:
                self.path = []
                name, ext = os.path.splitext(os.path.basename(data))

                _dir = join_filepath([output_dir, "tiff", name])
                create_directory(_dir)

                with tifffile.TiffFile(data) as tffl:
                    image = tffl.asarray()

                max_frames = image.shape[0]
                max_frame_per_part = math.ceil(
                    max_frames / math.ceil(size / MAXIMUM_IMAGE_DATA_PART_SIZE)
                )

                for t in np.arange(0, max_frames, max_frame_per_part):
                    _path = join_filepath(
                        [_dir, f"{name}_{t//max_frame_per_part}{ext}"]
                    )
                    with tifffile.TiffWriter(_path, bigtiff=True) as tif:
                        tif.write(image[t : t + max_frame_per_part])
                    self.path.append(_path)
        elif isinstance(data, list) and isinstance(data[0], str):
            self.path = data
        else:
            _dir = join_filepath([output_dir, "tiff", file_name])
            create_directory(_dir)

            _path = join_filepath([_dir, f"{file_name}.tif"])
            tifffile.imsave(_path, data)
            self.path = [_path]

            del data
            gc.collect()

    @property
    def data(self):
        if isinstance(self.path, list):
            return np.concatenate([imageio.volread(p) for p in self.path])
        else:
            return np.array(imageio.volread(self.path))

    def save_json(self, json_dir):
        if self.data.ndim < 3:
            self.json_path = join_filepath([json_dir, f"{self.file_name}.json"])
            JsonWriter.write_as_split(self.json_path, create_images_list(self.data))
            JsonWriter.write_plot_meta(json_dir, self.file_name, self.meta)

    @property
    def output_path(self) -> OutputPath:
        if self.data.ndim == 3:
            # self.path will be a list if self.data got into else statement on __init__
            if isinstance(self.path, list) and isinstance(self.path[0], str):
                _path = self.path[0]
            else:
                _path = self.path
            return OutputPath(
                path=_path,
                type=OutputType.IMAGE,
                max_index=len(self.data),
            )
        else:
            return OutputPath(
                path=self.json_path,
                type=OutputType.IMAGE,
                max_index=1,
            )
