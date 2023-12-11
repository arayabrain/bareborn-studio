from typing import List, Optional

from pydantic import BaseModel
from pydantic.dataclasses import Field

from studio.app.common.core.algo import AlgoTemplate
from studio.app.common.dataclass import ImageData
from studio.app.optinist.dataclass import FluoData, IscellData
from studio.app.optinist.wrappers.caiman.cnmf import CaimanCnmf


class InitParams(BaseModel):
    # Ain: Optional[List] = Field(
    #     None, description="possibility to seed with predetermined binary masks"
    # )
    do_refit: bool = Field(
        False,
        description=(
            "Whether to re-run seeded CNMFE on accepted patches "
            "to refine and perform deconvolution"
        ),
    )
    K: Optional[int] = Field(
        4, description="upper bound on number of components per patch, in general None"
    )
    gSig: List[int] = Field(
        [3, 3],
        description=(
            "gaussian width of a 2D gaussian kernel, which approximates a neuron"
        ),
    )
    gSiz: List[int] = Field(
        [13, 13],
        description=("average diameter of a neuron, in general 4*gSig+1"),
    )
    ssub: int = Field(
        1,
        description=(
            "downsampling factor in space for initialization, "
            "increase if you have memory problems. "
            "you can pass them here as boolean vectors"
        ),
    )
    tsub: int = Field(
        1,
        description=(
            "downsampling factor in time for initialization, "
            "increase if you have memory problems."
        ),
    )
    nb: int = Field(
        2,
        description="""
        number of background components (rank) if positive,
        else exact ring model with following settings.

        gnb= 0: Return background as b and W

        gnb=-1: Return full rank background B

        gnb<-1: Don't return background
        """,
    )
    min_corr: float = Field(0.8, description="min peak value from correlation image")
    min_pnr: int = Field(10, description="min peak to noise ration from PNR image")
    ssub_B: int = Field(
        2, description="additional downsampling factor in space for background"
    )
    ring_size_factor: float = Field(
        1.4, description=("radius of ring is gSiz*ring_size_factor")
    )


class PreprocessParams(BaseModel):
    p: int = Field(1, description="order of the autoregressive system")


class PatchParams(BaseModel):
    rf: Optional[int] = Field(
        40,
        description=(
            "half-size of the patches in pixels. e.g., if rf=40, patches are 80x80"
        ),
    )
    stride: int = Field(
        20,
        description=(
            "amount of overlap between the patches in pixels, "
            "(keep it at least large as gSiz, i.e 4 times the neuron size gSig)"
        ),
    )
    low_rank_background: Optional[bool] = Field(
        None,
        description=(
            "None leaves background of each patch intact, "
            "True performs global low-rank approximation if gnb>0"
        ),
    )
    nb_patch: int = Field(
        0,
        description=(
            "number of background components (rank) per patch if gnb>0, "
            "else it is set automatically"
        ),
    )


class MergeParams(BaseModel):
    thr: float = Field(0.9)
    merge_thr: float = Field(
        0.7, description="merging threshold, max correlation allowed"
    )


class CaimanCnmfEParams(BaseModel):
    init_params: InitParams = Field(InitParams())
    preprocess_params: PreprocessParams = Field(PreprocessParams())
    patch_params: PatchParams = Field(PatchParams())
    merge_params: MergeParams = Field(MergeParams())


class CaimanCnmfE(AlgoTemplate):
    def run(
        self, params: CaimanCnmfEParams, images: ImageData
    ) -> dict(fluorescence=FluoData, iscell=IscellData):
        cnmfe_fixed_params = {
            "center_psf": True,
            "method_init": "corr_pnr",  # use this for 1 photon
            "only_init": True,  # set it to True to run CNMF-E
            "normalize_init": False,
        }
        params["fixed_params"] = cnmfe_fixed_params

        return (
            CaimanCnmf()
            .set_output_dir(self.output_dir)
            .set_nwb_params(self.nwb_params)
            .run(params=params, images=images)
        )
