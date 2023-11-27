import { BASE_URL } from "const/API"
import axios from "utils/axios"
import { ParamMap } from "utils/param/ParamType"

export async function getAlgoParamsApi(algoName: string): Promise<ParamMap> {
  const response = await axios.get(`${BASE_URL}/params/${algoName}`)
  return response.data
}
