import logging
from pprint import pprint

from studio.app.common.core.utils.filepath_creater import join_filepath
from studio.app.common.dataclass import ImageData
from studio.app.dir_path import DIRPATH
from studio.app.optinist.microscopes.IsxdReader import IsxdReader


def read_inscopix(
    image: ImageData, output_dir: str, params: dict = None, **kwargs
) -> dict(imgs=ImageData):
    print("■■■: read_inscopix")
    if not IsxdReader.is_available():
        # Note: To output the logging contents to the console,
        #       specify the following options to pytest
        #   > pytest --log-cli-level=DEBUG
        logging.warning("IsxdReader is not available.")
        return

    # initialize
    data_reader = IsxdReader()
    data_reader.load(
        join_filepath([DIRPATH.INPUT_DIR, "1", "fixed-oist-sample_data_short.isxd"])
    )

    # debug print.
    import json

    # dump attributes
    pprint(json.dumps(data_reader.original_metadata))
    pprint(data_reader.ome_metadata)
    pprint(json.dumps(data_reader.lab_specific_metadata))

    # dump image stack
    # images_stack = data_reader.get_images_stack()
    # pprint(len(images_stack))

    return {"imgs": image}
