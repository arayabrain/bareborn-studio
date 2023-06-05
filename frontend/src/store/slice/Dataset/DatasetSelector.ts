import { RootState } from 'store/store'

export const selectProjectList = (state: RootState) => state.dataset.datasets
