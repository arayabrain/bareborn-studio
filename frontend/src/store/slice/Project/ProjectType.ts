export const PROJECT_SLICE_NAME = 'project'

export enum ProjectTypeValue {
  FACTOR = 0,
  WITHIN_FACTOR = 1,
}


export type Project = {
  projects: ProjectType[]
  currentProject?: {
    id?: string
  }
}

export type ProjectCreate = {
  project_name: string
  project_type: ProjectTypeValue
  image_count: number
}

export type ProjectType = {
  id: number | string
  uid?: number | string
  created_time: string
  updated_time: string
  role?: string | number
} & ProjectCreate
