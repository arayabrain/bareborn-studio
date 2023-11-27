from typing import Optional

from pydantic import BaseModel
from pydantic.dataclasses import Field


class Device(BaseModel):
    name: str = Field("Microscope device")
    description: str = Field("Microscope Information")
    manufacturer: str = Field("Microscope Manufacture")


class OpticalChannel(BaseModel):
    name: str = Field("OpticalChannel")
    description: str = Field("optical channel")
    emission_lambda: float = Field(500.0)


class ImagingPlane(BaseModel):
    name: str = Field("ImagingPlane")
    description: str = Field("standard")
    imaging_rate: float = Field(30.0)
    excitation_lambda: float = Field(900.0)
    indicator: str = Field("GCaMP")
    location: str = Field("V1")


class ImageSeries(BaseModel):
    starting_time: int = Field(0)
    starting_frame: list = Field(
        [
            0,
        ]
    )


class PlaneSegmentation(BaseModel):
    name: str = Field("PlaneSegmentation")
    description: str = Field("")


class Ophys(BaseModel):
    plane_segmentation: PlaneSegmentation = Field(PlaneSegmentation())


class NWBParams(BaseModel):
    session_description: str = Field("optinist")
    identifier: str = Field("optinist")
    experiment_description: Optional[str] = Field(None)
    device: Device = Field(Device())
    optical_channel: OpticalChannel = Field(OpticalChannel())
    imaging_plane: ImagingPlane = Field(ImagingPlane())
    image_series: ImageSeries = Field(ImageSeries())
    ophys: Ophys = Field(Ophys())
