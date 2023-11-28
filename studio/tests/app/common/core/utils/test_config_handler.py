import os

from studio.app.common.core.utils.config_handler import ConfigWriter
from studio.app.common.core.utils.filepath_creater import join_filepath
from studio.app.dir_path import DIRPATH

dirpath = f"{DIRPATH.DATA_DIR}/output"
filename = "test.yaml"


def test_config_writer():
    filepath = join_filepath([dirpath, filename])

    if os.path.exists(filepath):
        os.remove(filepath)

    ConfigWriter.write(dirpath, filename, {"test": "test"})

    assert os.path.exists(filepath)
