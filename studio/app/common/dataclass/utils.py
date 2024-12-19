import copy

import cv2
import numpy as np

from studio.app.const import THUMBNAIL_HEIGHT


def create_images_list(data):
    assert len(data.shape) == 2, "data is error"

    save_data = copy.deepcopy(data)
    data = data[np.newaxis, :, :]
    save_data = save_data[np.newaxis, :, :]

    images = []
    for _img in save_data:
        images.append(_img.tolist())

    return images


def save_thumbnail(plot_file):
    plot_img = cv2.imread(plot_file)
    h, w = plot_img.shape[:2]
    thumb_img = cv2.resize(
        plot_img, dsize=(int(w * (THUMBNAIL_HEIGHT / h)), THUMBNAIL_HEIGHT)
    )
    cv2.imwrite(plot_file.replace(".png", ".thumb.png"), thumb_img)
