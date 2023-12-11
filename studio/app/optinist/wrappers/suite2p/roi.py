from pydantic import BaseModel
from pydantic.dataclasses import Field

from studio.app.common.core.algo import AlgoTemplate
from studio.app.common.dataclass import ImageData
from studio.app.optinist.core.nwb.nwb import NWBDATASET
from studio.app.optinist.dataclass import FluoData, IscellData, RoiData, Suite2pData


class Suite2pRoiParams(BaseModel):
    tau: float = Field(1.0, description="this is the main parameter for deconvolution")

    # classification parameters
    soma_crop: bool = Field(
        True,
        description="crop dendrites for cell classification stats like compactness",
    )

    # cell detection settings
    high_pass: int = Field(
        100,
        description=(
            "running mean subtraction with window of size "
            "'high_pass(use low values for 1P"
        ),
    )
    sparse_mode: bool = Field(True, description="whether or not to run sparse_mode")
    max_overlap: float = Field(
        0.75,
        description=(
            "cells with more overlap than this "
            "get removed during triage before refinement"
        ),
    )
    nbinned: int = Field(
        5000, description=" max number of binned frames for cell detection"
    )
    spatial_scale: int = Field(
        0,
        description=(
            "0: multi-scale; 1: 6 pixels " "2: 12 pixels 3: 24 pixels 4: 48 pixels"
        ),
    )
    threshold_scaling: float = Field(
        1.0,
        description=(
            "adjust the automatically determined threshold " "by this scalar multiplier"
        ),
    )
    max_iterations: int = Field(
        20, description="maximum number of iterations to do cell detection"
    )

    # 1P settings
    spatial_hp_detect: int = Field(
        25,
        description=(
            "window for spatial high-pass filtering for neuropil subtraction "
            "before detection"
        ),
    )

    # output settings
    preclassify: float = Field(
        0.0,
        description="apply classifier before signal extraction with probability 0.3",
    )

    # ROI extraction parameters
    allow_overlap: bool = Field(
        False,
        description=(
            "pixels that are overlapping are thrown out (False) "
            "or added to both ROIs (True)"
        ),
    )
    inner_neuropil_radius: int = Field(
        2, description="number of pixels to keep between ROI and neuropil donut"
    )
    min_neuropil_pixels: int = Field(
        350, description="minimum number of pixels in the neuropil"
    )

    # deconvolution settings
    neucoeff: float = Field(0.7, description="neuropil coefficient")


class Suite2pRoi(AlgoTemplate):
    def run(
        self, params: Suite2pRoiParams, ops: Suite2pData
    ) -> dict(ops=Suite2pData, fluorescence=FluoData, iscell=IscellData):
        import numpy as np
        from suite2p import ROI, classification, default_ops, detection, extraction

        print("start suite2p_roi:", self.function_id)

        fs = self.nwb_params.get("imaging_plane", {}).get("imaging_rate", 30)

        ops = ops.data
        ops = {**default_ops(), **ops, **params, "fs": fs}

        # ROI detection
        ops_classfile = ops.get("classifier_path")
        builtin_classfile = classification.builtin_classfile
        user_classfile = classification.user_classfile
        if ops_classfile:
            print(f"NOTE: applying classifier {str(ops_classfile)}")
            classfile = ops_classfile
        elif ops["use_builtin_classifier"] or not user_classfile.is_file():
            print(f"NOTE: Applying builtin classifier at {str(builtin_classfile)}")
            classfile = builtin_classfile
        else:
            print(f"NOTE: applying default {str(user_classfile)}")
            classfile = user_classfile

        ops, stat = detection.detect(ops=ops, classfile=classfile)

        # ROI EXTRACTION
        ops, stat, F, Fneu, _, _ = extraction.create_masks_and_extract(ops, stat)
        stat = stat.tolist()

        # ROI CLASSIFICATION
        iscell = classification.classify(stat=stat, classfile=classfile)
        iscell = iscell[:, 0].astype(bool)

        arrays = []
        for i, s in enumerate(stat):
            array = ROI(
                ypix=s["ypix"],
                xpix=s["xpix"],
                lam=s["lam"],
                med=s["med"],
                do_crop=False,
            ).to_array(Ly=ops["Ly"], Lx=ops["Lx"])
            array *= i + 1
            arrays.append(array)

        im = np.stack(arrays)
        im[im == 0] = np.nan
        im -= 1

        # roiを追加
        roi_list = []
        for i in range(len(stat)):
            kargs = {}
            kargs["pixel_mask"] = np.array(
                [stat[i]["ypix"], stat[i]["xpix"], stat[i]["lam"]]
            ).T
            roi_list.append(kargs)

        # NWBを追加
        nwbfile = {}

        nwbfile[NWBDATASET.ROI] = {self.function_id: roi_list}

        # iscellを追加
        nwbfile[NWBDATASET.COLUMN] = {
            self.function_id: {
                "name": "iscell",
                "description": "two columns - iscell & probcell",
                "data": iscell,
            }
        }

        # Fluorenceを追加
        nwbfile[NWBDATASET.FLUORESCENCE] = {
            self.function_id: {
                "Fluorescence": {
                    "table_name": "Fluorescence",
                    "region": list(range(len(F))),
                    "name": "Fluorescence",
                    "data": F,
                    "unit": "lumens",
                    "rate": ops["fs"],
                },
                "Neuropil": {
                    "table_name": "Neuropil",
                    "region": list(range(len(Fneu))),
                    "name": "Neuropil",
                    "data": Fneu,
                    "unit": "lumens",
                    "rate": ops["fs"],
                },
            }
        }

        ops["stat"] = stat
        ops["F"] = F
        ops["Fneu"] = Fneu
        ops["iscell"] = iscell
        ops["im"] = im

        info = {
            "ops": Suite2pData(ops),
            "max_proj": ImageData(
                ops["max_proj"], output_dir=self.output_dir, file_name="max_proj"
            ),
            "Vcorr": ImageData(
                ops["Vcorr"], output_dir=self.output_dir, file_name="Vcorr"
            ),
            "fluorescence": FluoData(F, file_name="fluorescence"),
            "iscell": IscellData(iscell, file_name="iscell"),
            "all_roi": RoiData(
                np.nanmax(im, axis=0), output_dir=self.output_dir, file_name="all_roi"
            ),
            "non_cell_roi": RoiData(
                np.nanmax(im[~iscell], axis=0),
                output_dir=self.output_dir,
                file_name="noncell_roi",
            ),
            "cell_roi": RoiData(
                np.nanmax(im[iscell], axis=0),
                output_dir=self.output_dir,
                file_name="cell_roi",
            ),
            "nwbfile": nwbfile,
        }

        return info
