from typing import List

from pydantic import BaseModel
from pydantic.dataclasses import Field

from studio.app.common.core.algo import AlgoTemplate
from studio.app.common.dataclass import ImageData
from studio.app.optinist.dataclass import Suite2pData


class RegistrationParams(BaseModel):
    frames_include: int = Field(-1)
    keep_movie_raw: bool = Field(False)
    do_bidiphase: bool = Field(False)

    smooth_sigma: float = Field(1.15)
    smooth_sigma_time: int = Field(0)
    bidiphase: int = Field(0)
    maxregshift: float = Field(0.1)
    maxregshiftNR: int = Field(5)
    nonrigid: bool = Field(True)
    block_size: List[int] = Field([128, 128])
    snr_thresh: float = Field(1.2)
    functional_chan: int = Field(1)
    align_by_chan: int = Field(1)
    reg_tif: bool = Field(False)
    th_badframes: float = Field(1.0)
    diameter: int = Field(0)
    one_preg: bool = Field(False, alias="1Preg")
    spatial_hp_reg: int = Field(42)
    pre_smooth: int = Field(0)
    spatial_taper: int = Field(40)
    bidi_corrected: bool = Field(False)


class Suite2pRegistration(AlgoTemplate):
    def run(
        self, params: RegistrationParams, ops: Suite2pData
    ) -> dict(ops=Suite2pData):
        from suite2p import default_ops, registration

        print("start suite2p registration:", self.function_id)

        ops = ops.data
        refImg = ops["meanImg"]
        print("start suite2_registration")

        # REGISTRATION
        if len(refImg.shape) == 3:
            refImg = refImg[0]

        ops = {**default_ops(), **ops, **params}

        # register binary
        ops = registration.register_binary(ops, refImg=refImg)

        # compute metrics for registration
        if ops.get("do_regmetrics", True) and ops["nframes"] >= 1500:
            ops = registration.get_pc_metrics(ops)

        info = {
            "refImg": ImageData(
                ops["refImg"], output_dir=self.output_dir, file_name="refImg"
            ),
            "meanImgE": ImageData(
                ops["meanImgE"], output_dir=self.output_dir, file_name="meanImgE"
            ),
            "ops": Suite2pData(ops, file_name="ops"),
        }

        return info
