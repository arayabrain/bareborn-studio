from studio.app.optinist.wrappers.caiman.cnmf import CaimanCnmf
from studio.app.optinist.wrappers.caiman.motion_correction import CaimanMc

# from studio.app.optinist.wrappers.caiman.cnmfe import caiman_cnmfe

caiman_wrapper_dict = {
    "caiman": {
        "caiman_mc": {
            "function": CaimanMc(),
            "conda_name": "caiman",
        },
        "caiman_cnmf": {
            "function": CaimanCnmf(),
            "conda_name": "caiman",
        },
        # "caiman_cnmfe": {
        #     "function": caiman_cnmfe,
        #     "conda_name": "caiman",
        # },
    }
}
