import axiosLibrary from 'axios'
import { BASE_URL } from 'const/API'
import { getToken } from 'utils/auth'

const axios = axiosLibrary.create({
  baseURL: BASE_URL,
  timeout: 600000,
})

axios.interceptors.request.use(
  async (config) => {
    config.headers.Authorization = `Bearer ${getToken()}`
    return config
  },
  (error) => Promise.reject(error),
)


export default axios