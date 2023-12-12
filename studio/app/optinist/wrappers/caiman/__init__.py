from studio.app.optinist.wrappers.caiman.cnmf import CaimanCnmf
from studio.app.optinist.wrappers.caiman.cnmfe import CaimanCnmfE
from studio.app.optinist.wrappers.caiman.motion_correction import CaimanMc

caiman_wrapper_dict = {
    "caiman": {
        "caiman_mc": {
            "function": CaimanMc,
            "conda_name": "caiman",
        },
        "caiman_cnmf": {
            "function": CaimanCnmf,
            "conda_name": "caiman",
        },
        "caiman_cnmfe": {
            "function": CaimanCnmfE,
            "conda_name": "caiman",
        },
    }
}
