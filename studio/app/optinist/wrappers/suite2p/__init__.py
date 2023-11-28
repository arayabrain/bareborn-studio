from studio.app.optinist.wrappers.suite2p.file_convert import Suite2pFileConvert
from studio.app.optinist.wrappers.suite2p.registration import Suite2pRegistration
from studio.app.optinist.wrappers.suite2p.roi import Suite2pRoi
from studio.app.optinist.wrappers.suite2p.spike_deconv import Suite2pSpikeDeconv

suite2p_wrapper_dict = {
    "suite2p": {
        "suite2p_file_convert": {
            "function": Suite2pFileConvert,
            "conda_name": "suite2p",
        },
        "suite2p_registration": {
            "function": Suite2pRegistration,
            "conda_name": "suite2p",
        },
        "suite2p_roi": {
            "function": Suite2pRoi,
            "conda_name": "suite2p",
        },
        "suite2p_spike_deconv": {
            "function": Suite2pSpikeDeconv,
            "conda_name": "suite2p",
        },
    }
}
