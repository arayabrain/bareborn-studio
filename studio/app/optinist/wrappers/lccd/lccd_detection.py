import numpy as np
from pydantic import BaseModel
from pydantic.dataclasses import Field

from studio.app.common.core.algo import AlgoTemplate
from studio.app.common.dataclass import ImageData
from studio.app.optinist.core.nwb.nwb import NWBDATASET
from studio.app.optinist.dataclass import FluoData, LccdData, RoiData


class BlobDetectorParams(BaseModel):
    filtersize1: int = Field(100)
    filtersize2: int = Field(4)
    sigma: float = Field(1.25)
    fsize: int = Field(30)
    min_area: int = Field(20)
    max_area: int = Field(50)
    sparse: bool = Field(False)


class RoiIntegrationParams(BaseModel):
    overlap_threshold: float = Field(0.4)
    min_area: int = Field(20)
    max_area: int = Field(100)
    sparse: bool = Field(False)


class LccdParams(BaseModel):
    frame_divider: int = Field(100)


class DffParams(BaseModel):
    f0_frames: int = Field(100)
    f0_percentile: int = Field(8)


class LccdDetectParams(BaseModel):
    blob_detector: BlobDetectorParams = Field(BlobDetectorParams())
    roi_integration: RoiIntegrationParams = Field(RoiIntegrationParams())
    lccd: LccdParams = Field(LccdParams())
    dff: DffParams = Field(DffParams())


class LccdDetect(AlgoTemplate):
    def run(
        self, params: LccdDetectParams, mc_images: ImageData
    ) -> dict(fluorescence=FluoData, cell_roi=RoiData):
        from studio.app.optinist.wrappers.lccd.lccd_python.lccd import LCCD

        print("start lccd_detect:", self.function_id)

        print("params: ", params)
        lccd = LCCD(params)
        D = self.LoadData(mc_images)
        assert (
            len(D.shape) == 3
        ), "input array should have dimensions (width, height, time)"
        roi = lccd.apply(D)

        dff_f0_frames = params["dff"]["f0_frames"]
        dff_f0_percentile = params["dff"]["f0_percentile"]
        num_cell = roi.shape[1]
        num_frames = D.shape[2]
        is_cell = np.ones(num_cell, dtype=bool)

        reshapedD = D.reshape([D.shape[0] * D.shape[1], D.shape[2]])
        timeseries = np.zeros([num_cell, num_frames])
        roi_list = []

        for i in range(num_cell):
            roi_list.append((roi[:, i].reshape([D.shape[0], D.shape[1]])) * (i + 1))
            timeseries[i, :] = np.mean(reshapedD[roi[:, i] > 0, :], axis=0)

        im = np.stack(roi_list)
        im[im == 0] = np.nan
        im -= 1

        timeseries_dff = np.ones([num_cell, num_frames]) * np.nan
        for i in range(num_cell):
            for k in range(num_frames):
                if (k - dff_f0_frames >= 0) and (k + dff_f0_frames < num_frames):
                    f0 = np.percentile(
                        timeseries[i, k - dff_f0_frames : k + dff_f0_frames],
                        dff_f0_percentile,
                    )
                    timeseries_dff[i, k] = (timeseries[i, k] - f0) / f0

        roi_list = [
            {"image_mask": roi[:, i].reshape(D.shape[:2])} for i in range(num_cell)
        ]

        nwbfile = {}
        nwbfile[NWBDATASET.ROI] = {self.function_id: roi_list}
        nwbfile[NWBDATASET.COLUMN] = {
            self.function_id: {
                "name": "iscell",
                "description": "two columns - iscell & probcell",
                "data": is_cell,
            }
        }

        nwbfile[NWBDATASET.FLUORESCENCE] = {
            self.function_id: {
                "Fluorescence": {
                    "table_name": "Fluorescence",
                    "region": list(range(len(timeseries))),
                    "name": "Fluorescence",
                    "data": timeseries,
                    "unit": "lumens",
                }
            }
        }

        lccd_data = {}
        lccd_data["images"] = D
        lccd_data["roi"] = roi
        lccd_data["is_cell"] = is_cell

        info = {
            "lccd": LccdData(lccd_data),
            "cell_roi": RoiData(
                np.nanmax(im, axis=0), output_dir=self.output_dir, file_name="cell_roi"
            ),
            "fluorescence": FluoData(timeseries, file_name="fluorescence"),
            "dff": FluoData(timeseries_dff, file_name="dff"),
            "nwbfile": nwbfile,
        }

        return info

    @staticmethod
    def LoadData(mc_images):
        from PIL import Image

        img_pile = Image.open(mc_images.path[0])
        num_page = img_pile.n_frames

        imgs = np.zeros((img_pile.size[0], img_pile.size[1], num_page))
        for i in range(num_page):
            img_pile.seek(i)
            imgs[:, :, i] = np.asarray(img_pile)
        img_pile.close()

        maxval = np.max(imgs)
        minval = np.min(imgs)
        imgs = (imgs - minval) / (maxval - minval)

        return imgs
