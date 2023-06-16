import axios from "../../utils/axios";

type CutCoords = number[]

type Generate = {
  cut_coords: CutCoords[]
  threshold: number[]
}

export const saveParams = async (data: object) => {
  const response = await axios.post(`/image_stat/param`, data)
  return response.data
}

export const loadParams = async () => {
  const response = await axios.get(`/image_stat/param`)
  return response.data
}

export const postGenerate = async (data: Generate, id: string) => {
  const response = await axios.post(`/visualize/generate/${id}`, data)
  return response.data
}

export const downloadGenerate = async (data: Generate, id: string) => {
  const response = await axios.post(`/visualize/download/${id}`, data, {responseType: 'blob'})
  return response
}

export const getImageVisualize = async (path: string) => {
  const response = await axios.get(`/outputs/png_image/${path}`)
  return response.data
}
