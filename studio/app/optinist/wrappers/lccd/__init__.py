from studio.app.optinist.wrappers.lccd.lccd_detection import LccdDetect

lccd_wrapper_dict = {
    "lccd": {
        "lccd_cell_detection": {
            "function": LccdDetect,
            "conda_name": "lccd",
        },
    }
}
