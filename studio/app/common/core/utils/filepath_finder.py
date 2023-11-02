import os
from glob import glob
from typing import Optional

from studio.app.common.core.utils.filepath_creater import join_filepath
from studio.app.dir_path import DIRPATH


def find_filepath(name, category) -> Optional[str]:
    name, _ = os.path.splitext(name)

    filepaths = glob(
        join_filepath(
            [DIRPATH.APP_DIR, "*", "wrappers", "**", category, f"{name}.yaml"]
        ),
        recursive=True,
    )
    return filepaths[0] if len(filepaths) > 0 else None


def find_condaenv_filepath(name: str):
    return find_filepath(name, "conda")
