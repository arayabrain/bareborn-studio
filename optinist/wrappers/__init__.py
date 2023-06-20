from .suite2p_wrapper import suite2p_wrapper_dict
from .vbm_wrapper import vbm_wrapper_dict

# NOTE: Not used in "MRIAnalysisStudio".
#
# from .caiman_wrapper import caiman_wrapper_dict
# from .dummy_wrapper import dummy_wrapper_dict
# from .optinist_wrapper import optinist_wrapper_dict

wrapper_dict = {}
wrapper_dict.update(**suite2p_wrapper_dict)
wrapper_dict.update(**vbm_wrapper_dict)

# NOTE: Not used in "MRIAnalysisStudio".
#
# wrapper_dict.update(**caiman_wrapper_dict)
# wrapper_dict.update(**dummy_wrapper_dict)
# wrapper_dict.update(**optinist_wrapper_dict)
