from pydantic.dataclasses import dataclass

from studio.app.common.core.param.param import Param


@dataclass
class NWBDATASET:
    POSTPROCESS: str = "POSTPROCESS"
    TIMESERIES: str = "TIMESERIES"
    MOTION_CORRECTION: str = "MOCTION_CORRECTION"
    ROI: str = "ROI"
    COLUMN: str = "COLUMN"
    FLUORESCENCE: str = "FLUORESCENCE"
    BEHAVIOR: str = "BEHAVIOR"
    IMAGE_SERIES: str = "image_series"


class NWBParams:
    PARAMS = [
        Param(name="session_description", type=str, default="optinist"),
        Param(name="identifier", type=str, default="optinist"),
        Param(name="experiment_description", type=str, default=None),
        Param(name="name", type=str, default="Microscope device", section="device"),
        Param(
            name="description",
            type=str,
            default="Microscope Information",
            section="device",
        ),
        Param(
            name="manufacturer",
            type=str,
            default="Microscope Manufacture",
            section="device",
        ),
        Param(
            name="name", type=str, default="OpticalChannel", section="optical_channel"
        ),
        Param(
            name="description",
            type=str,
            default="optical channel",
            section="optical_channel",
        ),
        Param(
            name="emission_lambda", type=float, default=500.0, section="optical_channel"
        ),
        Param(name="name", type=str, default="ImagingPlane", section="imaging_plane"),
        Param(
            name="description", type=str, default="standard", section="imaging_plane"
        ),
        Param(name="imaging_rate", type=float, default=30.0, section="imaging_plane"),
        Param(
            name="excitation_lambda", type=float, default=600.0, section="imaging_plane"
        ),
        Param(name="indicator", type=str, default="GCaMap", section="imaging_plane"),
        Param(name="location", type=str, default="V1", section="imaging_plane"),
        Param(name="starting_time", type=int, default=0, section="image_series"),
        Param(
            name="starting_frame",
            type=list,
            default=[
                0,
            ],
            section="image_series",
        ),
        Param(
            name="name",
            type=str,
            default="PlaneSegmentation",
            section="ophys/plane_segmentation",
        ),
        Param(
            name="description", type=str, default="", section="ophys/plane_segmentation"
        ),
    ]
