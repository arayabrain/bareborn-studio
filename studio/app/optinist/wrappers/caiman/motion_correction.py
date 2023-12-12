import shutil
from typing import List, Optional

from pydantic import BaseModel
from pydantic.dataclasses import Field

from studio.app.common.core.algo import AlgoTemplate
from studio.app.common.core.utils.filepath_creater import (
    create_directory,
    join_filepath,
)
from studio.app.common.dataclass import ImageData
from studio.app.optinist.core.nwb.nwb import NWBDATASET
from studio.app.optinist.dataclass import RoiData


class CaimanMcParams(BaseModel):
    border_nan: str = Field("copy")
    gSig_filt: Optional[List] = Field(None)
    is3D: bool = Field(False)
    max_deviation_rigid: int = Field(3)
    max_shifts: List[int] = Field([6, 6])
    min_mov: Optional[float] = Field(None)
    niter_rig: int = Field(1)
    nonneg_movie: bool = Field(True)
    num_frames_split: int = Field(80)
    num_splits_to_process_els: Optional[int] = Field(None)
    num_splits_to_process_rig: Optional[int] = Field(None)
    overlaps: List[int] = Field([32, 32])
    pw_rigid: bool = Field(False)
    shifts_opencv: bool = Field(True)
    splits_els: int = Field(14)
    splits_rig: int = Field(14)
    strides: List[int] = Field([96, 96])
    upsample_factor_grid: int = Field(4)
    use_cuda: bool = Field(False)


class CaimanMc(AlgoTemplate):
    def run(
        self, params: CaimanMcParams, image: ImageData
    ) -> dict(mc_images=ImageData):
        import numpy as np
        from caiman import load_memmap, save_memmap, stop_server
        from caiman.base.rois import extract_binary_masks_from_structural_channel
        from caiman.cluster import setup_cluster
        from caiman.motion_correction import MotionCorrect
        from caiman.source_extraction.cnmf.params import CNMFParams

        print("start caiman motion_correction:", self.function_id)

        opts = CNMFParams()

        if params is not None:
            opts.change_params(params_dict=params)

        c, dview, n_processes = setup_cluster(
            backend="local", n_processes=None, single_thread=True
        )

        mc = MotionCorrect(image.path, dview=dview, **opts.get_group("motion"))

        mc.motion_correct(save_movie=True)
        border_to_0 = 0 if mc.border_nan == "copy" else mc.border_to_0

        # memory mapping
        fname_new = save_memmap(
            mc.mmap_file, base_name=self.function_id, order="C", border_to_0=border_to_0
        )

        stop_server(dview=dview)

        # now load the file
        Yr, dims, T = load_memmap(fname_new)

        images = np.array(Yr.T.reshape((T,) + dims, order="F"))

        meanImg = images.mean(axis=0)
        rois = (
            extract_binary_masks_from_structural_channel(
                meanImg, gSig=7, expand_method="dilation"
            )[0]
            .reshape(meanImg.shape[0], meanImg.shape[1], -1)
            .transpose(2, 0, 1)
        )

        rois = rois.astype(np.float)

        for i, _ in enumerate(rois):
            rois[i] *= i + 1

        rois = np.nanmax(rois, axis=0)
        rois[rois == 0] = np.nan
        rois -= 1

        xy_trans_data = (
            (np.array(mc.x_shifts_els), np.array(mc.y_shifts_els))
            if params["pw_rigid"]
            else np.array(mc.shifts_rig)
        )

        mc_images = ImageData(images, output_dir=self.output_dir, file_name="mc_images")

        nwbfile = {}
        nwbfile[NWBDATASET.MOTION_CORRECTION] = {
            self.function_id: {
                "mc_data": mc_images,
                "xy_trans_data": xy_trans_data,
            }
        }

        info = {
            "mc_images": mc_images,
            "meanImg": ImageData(
                meanImg, output_dir=self.output_dir, file_name="meanImg"
            ),
            "rois": RoiData(rois, output_dir=self.output_dir, file_name="rois"),
            "nwbfile": nwbfile,
        }

        # Clean up temporary files
        mmap_output_dir = join_filepath([self.output_dir, "mmap"])
        create_directory(mmap_output_dir)
        for mmap_file in mc.mmap_file:
            shutil.move(mmap_file, mmap_output_dir)
        shutil.move(fname_new, mmap_output_dir)

        return info
