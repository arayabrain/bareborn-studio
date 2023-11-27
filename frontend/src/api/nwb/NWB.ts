import { BASE_URL } from "const/API"
import axios from "utils/axios"
import { ParamMap } from "utils/param/ParamType"

export async function getNWBParamsApi(): Promise<ParamMap> {
  const response = await axios.get(`${BASE_URL}/nwb`)
  return response.data
}
