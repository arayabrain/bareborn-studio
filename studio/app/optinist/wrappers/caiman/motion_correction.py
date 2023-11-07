import shutil

from hdmf.utils import docval, popargs

from studio.app.common.core.param.param import Param
from studio.app.common.core.utils.filepath_creater import (
    create_directory,
    join_filepath,
)
from studio.app.common.core.wrapper.wrapper import Wrapper
from studio.app.common.dataclass import ImageData
from studio.app.optinist.core.nwb.nwb import NWBDATASET
from studio.app.optinist.dataclass import RoiData


class CaimanMc(Wrapper):
    _INPUT_NODES = [Param(name="image", type=ImageData)]
    _OUTPUT_NODES = [Param(name="mc_images", type=ImageData)]
    _DEFAULT_PARAMS = [
        Param(name="border_nan", type=str, default="copy"),
        Param(name="gSig_filt", type=list, default=None),
        Param(name="is3D", type=bool, default=False),
        Param(name="max_deviation_rigid", type=int, default=3),
        Param(name="max_shifts", type=list, default=[6, 6]),
        Param(name="min_mov", type=float, default=None),
        Param(name="niter_rig", type=int, default=1),
        Param(name="nonneg_movie", type=bool, default=True),
        Param(name="num_frames_split", type=int, default=80),
        Param(name="num_splits_to_process_els", type=int, default=None),
        Param(name="num_splits_to_process_rig", type=int, default=None),
        Param(name="overlaps", type=list, default=[32, 32]),
        Param(name="pw_rigid", type=bool, default=False),
        Param(name="shifts_opencv", type=bool, default=True),
        Param(name="splits_els", type=int, default=14),
        Param(name="splits_rig", type=int, default=14),
        Param(name="strides", type=list, default=[96, 96]),
        Param(name="upsample_factor_grid", type=int, default=4),
        Param(name="use_cuda", type=bool, default=False),
    ]

    @docval(
        *Wrapper.docval_params([*_INPUT_NODES, *_DEFAULT_PARAMS]),
        **Wrapper.docval_returns(_OUTPUT_NODES),
    )
    def func(self, **kwargs):
        """caiman_mc

        TODO: Add documentation for this function
        """
        import numpy as np
        from caiman import load_memmap, save_memmap, stop_server
        from caiman.base.rois import extract_binary_masks_from_structural_channel
        from caiman.cluster import setup_cluster
        from caiman.motion_correction import MotionCorrect
        from caiman.source_extraction.cnmf.params import CNMFParams

        print("start caiman motion_correction:", self.function_id)

        image = popargs("image", kwargs)
        opts = CNMFParams()

        if kwargs is not None:
            opts.change_params(params_dict=kwargs)

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
            if kwargs.get("pw_rigid", False)
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
