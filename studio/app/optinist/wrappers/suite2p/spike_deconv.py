from pydantic import BaseModel
from pydantic.dataclasses import Field

from studio.app.common.core.algo import AlgoTemplate
from studio.app.optinist.core.nwb.nwb import NWBDATASET
from studio.app.optinist.dataclass import FluoData, Suite2pData


class Suite2pSpikeDeconvParams(BaseModel):
    baseline: str = Field(
        "maximin", description="baselining mode (can also choose 'prctile')"
    )
    win_baseline: float = Field(60.0, description="window for maximin")
    sig_baseline: float = Field(
        10.0, description="smoothing constant for gaussian filter"
    )
    prctile_baseline: float = Field(
        8.0, description="optional (whether to use a percentile baseline)"
    )
    neucoeff: float = Field(0.7, description="neuropil coefficient")


class Suite2pSpikeDeconv(AlgoTemplate):
    def run(
        self, params: Suite2pSpikeDeconvParams, ops: Suite2pData
    ) -> dict(ops=Suite2pData, spks=FluoData):
        import numpy as np
        from suite2p import default_ops, extraction

        print("start suite2_spike_deconv:", self.function_id)

        ops = ops.data

        ops = {**default_ops(), **ops, **params}

        dF = ops["F"].copy() - ops["neucoeff"] * ops["Fneu"]
        dF = extraction.preprocess(
            F=dF,
            baseline=ops["baseline"],
            win_baseline=ops["win_baseline"],
            sig_baseline=ops["sig_baseline"],
            fs=ops["fs"],
            prctile_baseline=ops["prctile_baseline"],
        )
        spks = extraction.oasis(
            F=dF, batch_size=ops["batch_size"], tau=ops["tau"], fs=ops["fs"]
        )

        ops["spks"] = spks

        # NWBを追加
        nwbfile = {}

        # roiを追加
        stat = ops["stat"]
        roi_list = []
        for i in range(len(stat)):
            kargs = {}
            kargs["pixel_mask"] = np.array(
                [stat[i]["ypix"], stat[i]["xpix"], stat[i]["lam"]]
            ).T
            roi_list.append(kargs)

        nwbfile[NWBDATASET.ROI] = {self.function_id: {"roi_list": roi_list}}

        # Fluorenceを追加
        nwbfile[NWBDATASET.FLUORESCENCE] = {
            self.function_id: {
                "Deconvolved": {
                    "table_name": "Deconvolved",
                    "region": list(range(len(spks))),
                    "name": self.function_id + "_Deconvolved",
                    "data": spks,
                    "unit": "lumens",
                    "rate": ops["fs"],
                }
            }
        }

        info = {
            "ops": Suite2pData(ops),
            "spks": FluoData(spks, file_name="spks"),
            "nwbfile": nwbfile,
        }

        return info
