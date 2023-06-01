export const PROJECT_SLICE_NAME = 'project'

export type DatasetType = {
  folder_name: string
  sub_folders: { folder_name: string; source_image_ids: number[] }[]
  source_image_ids: number[]
}

export type Dataset = {
  datasets: DatasetType[]
}
