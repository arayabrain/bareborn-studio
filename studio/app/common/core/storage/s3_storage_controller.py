import os
import shutil

import boto3

from studio.app.common.core.logger import AppLogger
from studio.app.common.core.storage.remote_storage_controller import (
    BaseRemoteStorageController,
    RemoteSyncAction,
    RemoteSyncStatusFileUtil,
)
from studio.app.common.core.utils.filepath_creater import join_filepath
from studio.app.dir_path import DIRPATH

logger = AppLogger.get_logger()


class S3StorageController(BaseRemoteStorageController):
    """
    S3 Storage Controller
    """

    S3_STORAGE_URL = os.environ.get("S3_STORAGE_URL")
    S3_STORAGE_BUCKET = S3_STORAGE_URL.split("//")[-1]

    S3_INPUT_DIR = "input"
    S3_OUTPUT_DIR = "output"

    S3_STORAGE_OUTPUT_URL = f"{S3_STORAGE_URL}/{S3_OUTPUT_DIR}"

    def __init__(self):
        self.__s3_client = boto3.client("s3")
        self.__s3_resource = boto3.resource("s3")

    def make_experiment_local_path(self, workspace_id: str, unique_id: str) -> str:
        experiment_local_path = join_filepath(
            [DIRPATH.OUTPUT_DIR, workspace_id, unique_id]
        )
        return experiment_local_path

    def make_experiment_remote_path(self, workspace_id: str, unique_id: str) -> str:
        experiment_remote_path = join_filepath(
            [__class__.S3_OUTPUT_DIR, workspace_id, unique_id]
        )
        return experiment_remote_path

    def download_all_experiments_metas(self) -> bool:
        """
        Download all experiment metadata files from S3 using boto3.
        """
        paginator = self.__s3_client.get_paginator("list_objects_v2")
        target_files = []

        for page in paginator.paginate(
            Bucket=__class__.S3_STORAGE_BUCKET, Prefix=__class__.S3_OUTPUT_DIR
        ):
            for obj in page.get("Contents", []):
                if obj["Key"].endswith(DIRPATH.EXPERIMENT_YML) or obj["Key"].endswith(
                    DIRPATH.WORKFLOW_YML
                ):
                    target_files.append(obj["Key"])

        logger.debug(
            "download all metadata from remote storage (s3). [count: %d]",
            len(target_files),
        )

        for index, remote_config_yml_path in enumerate(target_files):
            relative_config_yml_path = remote_config_yml_path.replace(
                f"{__class__.S3_OUTPUT_DIR}/", ""
            )
            local_config_yml_path = f"{DIRPATH.OUTPUT_DIR}/{relative_config_yml_path}"
            local_config_yml_dir = os.path.dirname(local_config_yml_path)

            if not os.path.isfile(local_config_yml_path):
                logger.debug(
                    f"copy config_yml: {relative_config_yml_path} "
                    f"({index+1}/{len(target_files)})"
                )

                os.makedirs(local_config_yml_dir, exist_ok=True)

                self.__s3_client.download_file(
                    __class__.S3_STORAGE_BUCKET,
                    remote_config_yml_path,
                    local_config_yml_path,
                )
            else:
                logger.debug(
                    f"skip copy config_yml: {relative_config_yml_path} "
                    f"({index+1}/{len(target_files)})"
                )

        return True

    def download_experiment(self, workspace_id: str, unique_id: str) -> bool:
        # make paths
        experiment_local_path = self.make_experiment_local_path(workspace_id, unique_id)
        experiment_remote_path = self.make_experiment_remote_path(
            workspace_id, unique_id
        )

        logger.debug(
            "download data from remote storage (S3). [%s -> %s]",
            experiment_local_path,
            experiment_remote_path,
        )

        # ----------------------------------------
        # exec downloading
        # ----------------------------------------

        # clear remote_sync_status file.
        RemoteSyncStatusFileUtil.delete_sync_status_file(workspace_id, unique_id)

        # request s3 list_objects
        s3_list_objects = self.__s3_client.list_objects_v2(
            Bucket=__class__.S3_STORAGE_BUCKET, Prefix=experiment_remote_path
        )

        # check copy source directory
        if not s3_list_objects or s3_list_objects.get("KeyCount", 0) == 0:
            logger.warn(
                "remote data is not exists. [%s][%s]",
                __class__.S3_STORAGE_BUCKET,
                experiment_remote_path,
            )
            return False

        # cleaning data from local path
        if os.path.isdir(experiment_local_path):
            shutil.rmtree(experiment_local_path)

        # do download data from remote storage
        target_files_count = len(s3_list_objects["Contents"])
        for index, s3_object in enumerate(s3_list_objects["Contents"]):
            s3_file_path = s3_object["Key"]
            file_size = s3_object["Size"]

            # skip directory on s3
            if s3_file_path.endswith("/"):
                continue

            # make paths
            local_abs_path = os.path.join(
                os.path.dirname(DIRPATH.OUTPUT_DIR), s3_file_path
            )
            local_abs_dir = os.path.dirname(local_abs_path)

            logger.debug(
                f"download data from S3 ({index+1}/{target_files_count}) "
                f"{s3_file_path} ({file_size:,} bytes)"
            )

            # create local directory before downloading
            if not os.path.exists(local_abs_dir):
                os.makedirs(local_abs_dir)

            # do download experiment files
            self.__s3_client.download_file(
                __class__.S3_STORAGE_BUCKET, s3_file_path, local_abs_path
            )

        # creating remote_sync_status file.
        RemoteSyncStatusFileUtil.create_sync_status_file(
            workspace_id, unique_id, RemoteSyncAction.DOWNLOAD
        )

        return True

    def upload_experiment(
        self, workspace_id: str, unique_id: str, target_files: list = None
    ) -> bool:
        # make paths
        experiment_local_path = self.make_experiment_local_path(workspace_id, unique_id)
        experiment_remote_path = self.make_experiment_remote_path(
            workspace_id, unique_id
        )

        logger.debug(
            "upload data to remote storage (S3). [%s -> %s]",
            experiment_local_path,
            experiment_remote_path,
        )

        # ----------------------------------------
        # exec uploading
        # ----------------------------------------

        # clear remote_sync_status file.
        RemoteSyncStatusFileUtil.delete_sync_status_file(workspace_id, unique_id)

        # make target files path list
        # 1) Obtain target file path in absolute path format.
        target_abs_paths = []
        if target_files:  # Target specified files.
            target_abs_paths = [f"{experiment_local_path}/{f}" for f in target_files]
        else:  # Target all files.
            for root, dirs, files in os.walk(experiment_local_path):
                for filename in files:
                    local_abs_path = os.path.join(root, filename)
                    target_abs_paths.append(local_abs_path)

        # make target files path list
        # 2) Obtain target file path in transfer format to S3.
        adjusted_target_files = []
        for local_abs_path in target_abs_paths:
            local_relative_path = os.path.relpath(local_abs_path, experiment_local_path)

            s3_file_path = join_filepath(
                [
                    __class__.S3_OUTPUT_DIR,
                    workspace_id,
                    unique_id,
                    local_relative_path,
                ]
            )

            file_size = os.path.getsize(local_abs_path)
            adjusted_target_files.append([local_abs_path, s3_file_path, file_size])

        # do upload data to remote storage
        target_files_count = len(adjusted_target_files)
        for index, (local_abs_path, s3_file_path, file_size) in enumerate(
            adjusted_target_files
        ):
            logger.debug(
                f"upload data to S3 ({index+1}/{target_files_count}) "
                f"{s3_file_path} ({file_size:,} bytes)"
            )

            # do upload experiment files
            self.__s3_client.upload_file(
                local_abs_path, __class__.S3_STORAGE_BUCKET, s3_file_path
            )

        # creating remote_sync_status file.
        RemoteSyncStatusFileUtil.create_sync_status_file(
            workspace_id, unique_id, RemoteSyncAction.UPLOAD
        )

        return True

    def delete_experiment(self, workspace_id: str, unique_id: str) -> bool:
        # make paths
        experiment_remote_path = self.make_experiment_remote_path(
            workspace_id, unique_id
        )

        logger.debug(
            "delete data from remote storage (s3). [%s]",
            experiment_remote_path,
        )

        # ----------------------------------------
        # exec deleting
        # ----------------------------------------

        # do delete data from remote storage
        self.__s3_resource.Bucket(__class__.S3_STORAGE_BUCKET).objects.filter(
            Prefix=experiment_remote_path
        ).delete()

        return True
