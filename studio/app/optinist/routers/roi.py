from fastapi import APIRouter

from studio.app.optinist.core.edit_ROI import ACTION, EditROI
from studio.app.optinist.schemas.roi import EditRoiSuccess, RoiList, RoiPos

router = APIRouter(prefix="/outputs", tags=["outputs"])


@router.post("/image/{filepath:path}/add_roi", response_model=EditRoiSuccess)
async def add_roi(filepath: str, pos: RoiPos):
    EditROI(action=ACTION.ADD, filepath=filepath, params=pos.dict()).excute()
    return EditRoiSuccess(max_index=0)


@router.post("/image/{filepath:path}/merge_roi", response_model=EditRoiSuccess)
async def merge_roi(filepath: str, roi_list: RoiList):
    EditROI(action=ACTION.MERGE, filepath=filepath, params=roi_list.dict()).excute()
    return EditRoiSuccess(max_index=0)


@router.post("/image/{filepath:path}/delete_roi", response_model=EditRoiSuccess)
async def delete_roi(filepath: str, roi_list: RoiList):
    EditROI(action=ACTION.DELETE, filepath=filepath, params=roi_list.dict()).excute()
    return EditRoiSuccess(max_index=0)