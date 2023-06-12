import { RootState } from 'store/store'
import { SubFolder } from './DatasetType'

export const selectDataset = (state: RootState) => state.dataset

export const selectCurrentProjectId = (state: RootState) =>
  state.dataset.project_id

const getUrlFromSubfolder = (subfolders: SubFolder[], urls: string[]) => {
  subfolders.forEach((sub) => {
    if (sub.sub_folders) {
      getUrlFromSubfolder(sub.sub_folders, urls)
    } else if (sub.images?.length) {
      const urlsImage = sub.images.map((image) => image.image_url)
      urls.push(...urlsImage)
    }
  })
  return urls
}

export const selectListImageUrl = (state: RootState): string[] => {
  if (!state.dataset.dataset) return []
  let urls: string[] = []
  urls = getUrlFromSubfolder(state.dataset.dataset.sub_folders, urls)
  return urls
}
