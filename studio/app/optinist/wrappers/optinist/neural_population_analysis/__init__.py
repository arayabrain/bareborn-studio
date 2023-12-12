from studio.app.optinist.wrappers.optinist.neural_population_analysis.correlation import (  # noqa: E501
    Correlation,
)
from studio.app.optinist.wrappers.optinist.neural_population_analysis.cross_correlation import (  # noqa: E501
    CrossCorrelation,
)
from studio.app.optinist.wrappers.optinist.neural_population_analysis.granger import (
    Granger,
)

neural_population_analysis_wrapper_dict = {
    "correlation": {
        "function": Correlation,
    },
    "cross_correlation": {
        "function": CrossCorrelation,
        "conda_name": "optinist",
    },
    "granger": {
        "function": Granger,
        "conda_name": "optinist",
    },
}
