import axios from 'utils/axios'

import { RunPostData } from 'api/run/Run'
import { BASE_URL } from 'const/API'

export async function importWorkflowByUidApi(
  workspaceId: string,
  uid: string,
): Promise<RunPostData> {
  const response = await axios.get(
    `${BASE_URL}/workflow/import/${workspaceId}/${uid}`,
  )
  return response.data
}

export async function downloadWorkflowConfigApi(
  workspaceId: string,
  uid: string,
) {
  const response = await axios.get(
    `${BASE_URL}/workflow/download/${workspaceId}/${uid}`,
    {
      responseType: 'blob',
    },
  )
  return response.data
}

export async function loadWorkflowConfigApi(
  formData: FormData,
): Promise<RunPostData> {
  const response = await axios.post(`${BASE_URL}/workflow/load`, formData)
  return response.data
}