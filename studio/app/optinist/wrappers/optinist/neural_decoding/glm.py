#  decoding neural activity by GLM
#  input:  A:matrix[num_cell x timeseries ]   B:timeseries(behavior)[1 x timeseries]
#  Generalized linear modeling using statsmodels
#
#  https://www.statsmodels.org/stable/glm.html

from typing import List, Optional

from pydantic import BaseModel
from pydantic.dataclasses import Field

from studio.app.common.core.algo import AlgoTemplate
from studio.app.common.dataclass import BarData, HTMLData, ScatterData
from studio.app.optinist.core.nwb.nwb import NWBDATASET
from studio.app.optinist.dataclass import BehaviorData, FluoData, IscellData
from studio.app.optinist.wrappers.optinist.utils import standard_norm


class GLMMainParams(BaseModel):
    offset: Optional[List] = Field(None)
    exposure: Optional[List] = Field(None)
    missing: Optional[str] = Field(None)


class GLMParams(BaseModel):
    standard_x_mean: bool = Field(True)
    standard_x_std: bool = Field(True)
    standard_y_mean: bool = Field(True)
    standard_y_std: bool = Field(True)
    transpose_x: bool = Field(True)
    transpose_y: bool = Field(False)
    target_index: int = Field(0)
    add_constant: bool = Field(False)
    link: str = Field("log")
    family: str = Field("Gaussian")
    GLM: GLMMainParams = Field(GLMMainParams())


class GLM(AlgoTemplate):
    def run(
        self,
        params: GLMParams,
        neural_data: FluoData,
        behaviors_data: BehaviorData,
        iscell: IscellData = None,
    ) -> dict():
        # modules specific to function
        import numpy as np
        import pandas as pd
        import statsmodels.api as sm

        print("start glm:", self.function_id)

        neural_data = neural_data.data
        behaviors_data = behaviors_data.data

        # data should be time x component matrix
        if params["transpose_x"]:
            X = neural_data.transpose()
        else:
            X = neural_data

        if params["transpose_y"]:
            Y = behaviors_data.transpose()
        else:
            Y = behaviors_data

        assert (
            X.shape[0] == Y.shape[0]
        ), f"""
            neural_data and behaviors_data is not same dimension,
            neural.shape{X.shape}, behavior.shape{Y.shape}"""

        if iscell is not None:
            iscell = iscell.data
            ind = np.where(iscell > 0)[0]
            X = X[:, ind]
            Y = Y[:, ind]

        Y = Y[:, params["target_index"]].reshape(-1, 1)

        # preprocessing
        tX = standard_norm(X, params["standard_x_mean"], params["standard_x_std"])
        tY = standard_norm(Y, params["standard_y_mean"], params["standard_y_std"])

        # calculate GLM
        tX = pd.DataFrame(tX)
        tY = pd.DataFrame(tY)

        if params["add_constant"]:
            tX = sm.add_constant(tX, prepend=False)

        # set family
        link = getattr(sm.genmod.families.links, params["link"])()  # noqa: F841
        family = eval(f"sm.families.{params['family']}(link=link)")

        # model fit
        model = sm.GLM(tY, tX, family=family, **params["GLM"])
        Res = model.fit()

        # NWB追加
        nwbfile = {}
        nwbfile[NWBDATASET.POSTPROCESS] = {
            self.function_id: {
                "actual_predicted": np.array([Res._endog, Res.mu]).transpose(),
                "params": Res.params.values,
                "pvalues": Res.pvalues.values,
                "tvalues": Res.tvalues.values,  # z
                "aic": [Res.aic],
                "bic_llf": [Res.bic_llf],
                "llf": [Res.llf],  # log-Likelihood
                "pearson_chi2": [Res.pearson_chi2],
                "df_model": [Res.df_model],
                "df_resid": [Res.df_resid],
                "scale": [Res.scale],
                "mu": Res.mu,
                "endog": Res._endog,
            }
        }

        # main results for plot
        # plot should be reconsidered --- what they should be!
        info = {
            "actual_predicted": ScatterData(
                np.array([Res._endog, Res.mu]).transpose(), file_name="actual_predicted"
            ),
            "params": BarData(Res.params.values, file_name="params"),
            "textout": HTMLData(Res.summary().as_html(), file_name="textout"),
            "nwbfile": nwbfile,
        }

        return info
